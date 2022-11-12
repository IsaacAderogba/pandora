import { actions } from "../../../libs/actions/client";
import { Note } from "../../../libs/actions/types";
import {
  createNote,
  createSection,
  createSentence,
} from "../../../libs/actions/utils";
import { isBlockDoc } from "../../../libs/notion/narrowings";
import {
  $pageStatus,
  $pageTitle,
  $parentId,
  $richTextsPlainText,
} from "../../../libs/notion/selectors";
import { PageDoc } from "../../../libs/notion/types";
import { prisma } from "../../../libs/prisma";
import { scholar } from "../../../libs/scholar/client";
import { Paper } from "../../../libs/scholar/types";
import { KEYWORDS_DATABASE_ID } from "../../../utils/consts";
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

    console.log(scoredNotes);

    return page;
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
}
