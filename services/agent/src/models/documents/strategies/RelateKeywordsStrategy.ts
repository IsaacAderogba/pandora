import { actions } from "../../../libs/actions/client";
import { Note } from "../../../libs/actions/types";
import {
  createNote,
  createSection,
  createSentence,
} from "../../../libs/actions/utils";
import { tokenizeSentences } from "../../../libs/compromise/utils";
import { isBlockDoc, isCommentDoc } from "../../../libs/notion/narrowings";
import {
  $blockText,
  $commentText,
  $pageStage,
} from "../../../libs/notion/selectors";
import { BlockDoc, CommentDoc, PageDoc } from "../../../libs/notion/types";
import { prisma } from "../../../libs/prisma";
import { PageStrategy } from "./Strategy";

export class RelateKeywordsStrategy implements PageStrategy {
  run: PageStrategy["run"] = async (_, page) => {
    if (this.shouldSkipStrategy(page)) return page;

    const childDocs = await this.fetchChildDocs(page);
    const note = this.createActionNote(page, childDocs);
    const processedNote = await actions.extraction.keywords({ notes: [note] });
    console.log(processedNote[0]);

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
}
