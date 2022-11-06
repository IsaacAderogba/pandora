import { ExtractionKeywordsResult } from "../../../libs/actions/api";
import { actions } from "../../../libs/actions/client";
import { Note } from "../../../libs/actions/types";
import {
  createNote,
  createSection,
  createSentence,
} from "../../../libs/actions/utils";
import { tokenizeSentences } from "../../../libs/compromise/utils";
import { notion } from "../../../libs/notion/client";
import { isBlockDoc, isCommentDoc } from "../../../libs/notion/narrowings";
import {
  $blockText,
  $commentText,
  $pageStage,
} from "../../../libs/notion/selectors";
import { BlockDoc, PageDoc } from "../../../libs/notion/types";
import { prisma } from "../../../libs/prisma";
import { KEYWORDS_DATABASE_ID } from "../../../utils/consts";
import { PageStrategy } from "./Strategy";

export class RelateKeywordsStrategy implements PageStrategy {
  run: PageStrategy["run"] = async (_, page) => {
    if (this.shouldSkipStrategy(page)) return page;

    const childDocs = await this.fetchChildDocs(page);
    const note = this.createActionNote(page, childDocs);
    const processedNote = await actions.extraction.keywords({ notes: [note] });
    const keywordIds = await this.upsertKeywordPagesRemotely(processedNote);

    return page;
  };

  shouldSkipStrategy = ({ data }: PageDoc): boolean => {
    if ($pageStage(data)?.select?.name === "0") return true;
    return false;
  };

  fetchChildDocs = async (doc: PageDoc | BlockDoc): Promise<BlockDoc[]> => {
    const docs: BlockDoc[] = [];
    const ids = doc.metadata.blockIds;

    const results = await prisma.doc.findMany({ where: { id: { in: ids } } });
    for (const result of results) {
      if (isBlockDoc(result)) {
        docs.push(result, ...(await this.fetchChildDocs(result)));
      }
    }

    return docs;
  };

  createActionNote = (page: PageDoc, docs: BlockDoc[]): Note => {
    return createNote(
      page.id,
      null,
      docs.map((block) => {
        const text = isCommentDoc(block)
          ? $commentText(block.data)
          : $blockText(block.data);
        const sentences = tokenizeSentences(text);

        return createSection(
          block.id,
          null,
          sentences.map((sentence) => createSentence(null, null, sentence))
        );
      })
    );
  };

  upsertKeywordPagesRemotely = async (
    results: ExtractionKeywordsResult
  ): Promise<Set<string>> => {
    const keywordIds = new Set<string>();

    for (const result of results) {
      if (!result.metadata) continue;

      for (const [id, { term }] of Object.entries(result.metadata)) {
        let page = await notion.pageFindExternal(KEYWORDS_DATABASE_ID, id);

        if (!page) {
          page = await notion.pageCreate({
            parent: { database_id: KEYWORDS_DATABASE_ID },
            icon: { external: { url: process.env.PANDORA_ICON_URL } },
            properties: {
              Name: {
                type: "title",
                title: [{ type: "text", text: { content: term } }],
              },
              "External Id": {
                type: "rich_text",
                rich_text: [{ type: "text", text: { content: id } }],
              },
              Stage: { select: { name: "0" } },
            },
          });
        }

        keywordIds.add(page.id);
      }
    }

    return keywordIds;
  };
}
