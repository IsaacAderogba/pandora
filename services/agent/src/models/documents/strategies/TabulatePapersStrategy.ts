import { SimilarityCosineResult } from "../../../libs/actions/api";
import { actions } from "../../../libs/actions/client";
import { Note } from "../../../libs/actions/types";
import {
  createNote,
  createSection,
  createSentence,
} from "../../../libs/actions/utils";
import {
  TableBlockRequest,
  TableRowBlockRequest,
} from "../../../libs/notion/blocks";
import { notion } from "../../../libs/notion/client";
import { isBlockDoc, isPageDoc } from "../../../libs/notion/narrowings";
import {
  $pageDoc,
  $pageStatus,
  $pageTitle,
  $parentId,
  $richTextsPlainText,
} from "../../../libs/notion/selectors";
import { PageDoc } from "../../../libs/notion/types";
import { prisma } from "../../../libs/prisma";
import { scholar } from "../../../libs/scholar/client";
import { Paper, PaperDetail } from "../../../libs/scholar/types";
import { KEYWORDS_DATABASE_ID } from "../../../utils/consts";
import { upsertBlock } from "../block";
import { PageStrategy } from "./Strategy";

export class TabulatePapersStrategy implements PageStrategy {
  run: PageStrategy["run"] = async (_, page) => {
    if (await this.shouldSkipStrategy(page)) return page;

    const title = $pageTitle(page.data);
    const { data: papers } = await scholar.paperSearch({
      query: title,
      limit: 100,
    });

    const scoredNotes = await actions.similarity.cosine({
      text: title,
      notes: this.createActionNotes(papers),
    });

    const processedPapers = this.processNotesToPapers(scoredNotes, papers);

    const table = this.prepareTable();
    for (const paper of processedPapers) {
      const [detail, recommended] = await Promise.all([
        scholar.paperDetails(paper.paperId),
        scholar.paperRecommendations(paper.paperId, { limit: 10 }),
      ]);

      table.table.children.push(this.prepareTableRow(detail, recommended));
    }

    const { results } = await notion.blockAppend({
      block_id: page.id,
      children: [table],
    });

    for (const block of results) {
      await upsertBlock(block, { blockIds: [], commentIds: [] }, page.id);
    }

    return this.updatePageMetadata(
      page,
      results.map((r) => r.id)
    );
  };

  shouldSkipStrategy = async ({
    data,
    metadata,
  }: PageDoc): Promise<boolean> => {
    if ($pageStatus(data)?.status?.name !== "Done") return true;
    if ($parentId(data.parent) !== KEYWORDS_DATABASE_ID) return true;

    const ids = metadata.blockIds;
    const children = await prisma.doc.findMany({ where: { id: { in: ids } } });
    const tableIds = children
      .filter(isBlockDoc)
      .filter((doc) => doc.data.type === "table")
      .map((table) => table.id);

    const rows = await prisma.doc.findMany({ where: { id: { in: tableIds } } });
    return rows.filter(isBlockDoc).some(({ data }) => {
      if (data.type === "table_row") {
        return data.table_row.cells.map(
          (cell) => $richTextsPlainText(cell) === "Paper"
        );
      }
      return false;
    });
  };

  createActionNotes = (papers: Paper[]): Note[] => {
    return papers.map(({ paperId, title, abstract }) =>
      createNote(paperId, null, [
        createSection(
          null,
          null,
          [title, abstract]
            .filter((text) => !!text)
            .map((text) => {
              return createSentence(null, null, text);
            })
        ),
      ])
    );
  };

  processNotesToPapers = (
    notes: SimilarityCosineResult,
    papers: Paper[]
  ): Paper[] => {
    const papersMap = new Map(papers.map((paper) => [paper.paperId, paper]));
    const sortedNotes = notes
      .sort(
        (a, b) => b.metadata.similarity_cosine - a.metadata.similarity_cosine
      )
      .slice(0, 5);

    return sortedNotes.map((note) => papersMap.get(note.id!)!);
  };

  prepareTable = (): TableBlockRequest => {
    return {
      type: "table",
      table: {
        table_width: 3,
        has_row_header: true,
        children: [
          {
            table_row: {
              cells: [
                [{ text: { content: "Paper" } }],
                [{ text: { content: "Abstract" } }],
                [{ text: { content: "Related Papers" } }],
              ],
            },
          },
        ],
      },
    };
  };

  prepareTableRow = (
    {
      abstract,
      authors,
      fieldsOfStudy,
      journal,
      tldr,
      title,
      year,
      url,
    }: PaperDetail,
    recommended: Paper[]
  ): TableRowBlockRequest => {
    return {
      table_row: {
        cells: [
          [
            { text: { content: `${title} (${year})`, link: { url } } },
            {
              text: {
                content: `\nIn ` + [journal.name, ...fieldsOfStudy].join(", "),
              },
            },
            {
              text: {
                content:
                  "\nBy " + authors.map((author) => author.name).join(", "),
              },
            },
            { text: { content: `\n${tldr}` } },
          ],
          [{ text: { content: abstract } }],
          recommended.map(({ title, year, url }) => ({
            text: { content: `${title} (${year})`, link: { url } },
          })),
        ],
      },
    };
  };

  updatePageMetadata = async (
    page: PageDoc,
    blockIds: string[]
  ): Promise<PageDoc> => {
    const { metadata } = $pageDoc(page.data, {
      blockIds: [...page.metadata.blockIds, ...blockIds],
      commentIds: page.metadata.commentIds,
    });

    const doc = await prisma.doc.update({
      where: { id: page.id },
      data: { metadata },
    });

    if (!isPageDoc(doc)) throw new Error("Expected page doc");
    return doc;
  };
}
