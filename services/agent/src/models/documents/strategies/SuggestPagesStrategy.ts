import { ExtractionKeywordsResult } from "../../../libs/actions/api";
import { actions } from "../../../libs/actions/client";
import { Note } from "../../../libs/actions/types";
import {
  createNote,
  createSection,
  createSentence,
} from "../../../libs/actions/utils";
import { tokenizeSentences } from "../../../libs/compromise/utils";
import { RichTextRequest } from "../../../libs/notion/blocks";
import { notion } from "../../../libs/notion/client";
import {
  isBlockDoc,
  isCommentDoc,
  isPageDoc,
} from "../../../libs/notion/narrowings";
import {
  $blockText,
  $commentText,
  $pageDoc,
  $pageStatus,
  $pageTitle,
  $parentId,
} from "../../../libs/notion/selectors";
import { BlockDoc, PageDoc } from "../../../libs/notion/types";
import { prisma } from "../../../libs/prisma";
import { KEYWORDS_DATABASE_ID, PANDORA_ID } from "../../../utils/consts";
import { upsertComment } from "../comment";
import { PageStrategy } from "./Strategy";

export class SuggestPagesStrategy implements PageStrategy {
  run: PageStrategy["run"] = async (_, page) => {
    if (await this.shouldSkipStrategy(page)) return page;

    const childDocs = await this.fetchChildDocs(page);
    const note = this.createActionNote(page, childDocs);
    const processedNote = await actions.extraction.keywords({ notes: [note] });
    const { text, keywords } = this.getKeywordsText(page, processedNote);
    if (!keywords.length) return page;

    const comment = await notion.commentCreate({
      parent: { page_id: page.id },
      rich_text: [...text],
    });
    await upsertComment(comment, page.id);

    return this.updatePageMetadata(page, comment.id);
  };

  shouldSkipStrategy = async ({
    data,
    metadata,
  }: PageDoc): Promise<boolean> => {
    if ($pageStatus(data)?.status?.name !== "Done") return true;
    if ($parentId(data.parent) === KEYWORDS_DATABASE_ID) return true;

    const ids = metadata.commentIds;
    const children = await prisma.doc.findMany({ where: { id: { in: ids } } });
    return children.filter(isCommentDoc).some((comment) => {
      return (
        comment.data.created_by.id === PANDORA_ID &&
        $commentText(comment.data).includes("candidate keyword")
      );
    });
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
        const sentences = [$pageTitle(page.data), ...tokenizeSentences(text)];

        return createSection(
          block.id,
          null,
          sentences.map((sentence) => createSentence(null, null, sentence))
        );
      })
    );
  };

  getKeywordsText = (
    page: PageDoc,
    results: ExtractionKeywordsResult
  ): { text: RichTextRequest[]; keywords: string[] } => {
    let keywords: string[] = [];

    for (const { metadata } of results) {
      if (!metadata) continue;
      keywords.push(...Object.values(metadata.keywords).map((k) => k.term));
    }

    if (!keywords.length) return { text: [], keywords: [] };

    let content: string;
    if (keywords.length === 1) {
      content = `${keywords[0]} is a candidate keyword for this page.`;
      keywords = [keywords[0]];
    } else if (keywords.length === 2) {
      content = `${keywords[0]} and ${keywords[1]} are candidate keywords for this page.`;
      keywords = [keywords[0], keywords[1]];
    } else {
      const [first, second, third] = keywords.slice(0, 3);
      content = `${first}, ${second}, and ${third} are candidate keywords for this page.`;
      keywords = [first, second, third];
    }

    return { text: [{ text: { content } }], keywords: [] };
  };

  updatePageMetadata = async (
    page: PageDoc,
    commentId: string
  ): Promise<PageDoc> => {
    const { metadata } = $pageDoc(page.data, {
      blockIds: page.metadata.blockIds,
      commentIds: [...page.metadata.commentIds, commentId],
    });

    const doc = await prisma.doc.update({
      where: { id: page.id },
      data: { metadata },
    });

    if (!isPageDoc(doc)) throw new Error("Expected page doc");
    return doc;
  };
}
