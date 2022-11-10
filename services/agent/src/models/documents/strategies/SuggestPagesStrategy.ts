import { Doc } from "@prisma/client";
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
  isDatabaseDoc,
  isPageDoc,
} from "../../../libs/notion/narrowings";
import {
  $blockPageMentions,
  $blockText,
  $commentPageMentions,
  $commentText,
  $pageDoc,
  $pageStatus,
  $pageTitle,
} from "../../../libs/notion/selectors";
import { BlockDoc, PageDoc } from "../../../libs/notion/types";
import { prisma } from "../../../libs/prisma";
import { PANDORA_ID } from "../../../utils/consts";
import { searchDocs } from "../base";
import { upsertComment } from "../comment";
import { PageStrategy } from "./Strategy";

export class SuggestPagesStrategy implements PageStrategy {
  run: PageStrategy["run"] = async (_, page) => {
    if (await this.shouldSkipStrategy(page)) return page;

    const childDocs = await this.fetchChildBlocks(page);
    const note = this.prepareNote(page, childDocs);
    const processedNote = await actions.extraction.keywords({ notes: [note] });
    const keywords = this.prepareKeywords(processedNote);
    const rich_text = await this.preparePagesComment(page, childDocs, keywords);
    if (!rich_text.length) return page;

    const comment = await notion.commentCreate({
      parent: { page_id: page.id },
      rich_text,
    });
    await upsertComment(comment, page.id);

    return this.updatePageMetadata(page, comment.id);
  };

  shouldSkipStrategy = async ({
    data,
    metadata,
  }: PageDoc): Promise<boolean> => {
    if ($pageStatus(data)?.status?.name !== "Done") return true;

    const ids = metadata.commentIds;
    const children = await prisma.doc.findMany({ where: { id: { in: ids } } });
    return children.filter(isCommentDoc).some((comment) => {
      return (
        comment.data.created_by.id === PANDORA_ID &&
        $commentText(comment.data).includes("Unlinked relations")
      );
    });
  };

  fetchChildBlocks = async (doc: PageDoc | BlockDoc): Promise<BlockDoc[]> => {
    const docs: BlockDoc[] = [];
    const ids = doc.metadata.blockIds;

    const results = await prisma.doc.findMany({ where: { id: { in: ids } } });
    for (const result of results) {
      if (isBlockDoc(result)) {
        docs.push(result, ...(await this.fetchChildBlocks(result)));
      }
    }

    return docs;
  };

  prepareNote = (page: PageDoc, docs: BlockDoc[]): Note => {
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

  prepareKeywords = (results: ExtractionKeywordsResult): string[] => {
    const keywords: string[] = [];
    for (const { metadata } of results) {
      if (!metadata) continue;
      keywords.push(...Object.values(metadata.keywords).map((k) => k.term));
    }
    return keywords.slice(0, 3);
  };

  preparePagesComment = async (
    { id, metadata }: PageDoc,
    docs: BlockDoc[],
    keywords: string[]
  ): Promise<RichTextRequest[]> => {
    const comments = await prisma.doc.findMany({
      where: { id: { in: metadata.commentIds } },
    });

    const blacklist = new Set<string>([id]);
    [...docs, ...comments].forEach((doc) => {
      blacklist.add(id);
      if (doc.parentId) blacklist.add(doc.parentId);

      if (isBlockDoc(doc)) {
        $blockPageMentions(doc.data).forEach((id) => blacklist.add(id));
      } else if (isCommentDoc(doc)) {
        $commentPageMentions(doc.data).forEach((id) => blacklist.add(id));
      }
    });

    const pageDocs: PageDoc[] = [];
    async function buildPageDocs(doc: Doc | null): Promise<void> {
      if (!doc || !doc.parentId || blacklist.has(doc.id)) return;

      if (isPageDoc(doc)) {
        const parent = await prisma.doc.findUnique({
          where: { id: doc.parentId },
        });

        const pageIsNotArchived =
          parent &&
          isDatabaseDoc(parent) &&
          parent.metadata.pageIds.includes(doc.id);

        if (pageIsNotArchived) pageDocs.push(doc);
      } else if (isBlockDoc(doc)) {
        return await buildPageDocs(
          await prisma.doc.findUnique({
            where: { id: doc.parentId },
          })
        );
      }
    }

    const results = await Promise.all(keywords.map((k) => searchDocs(k)));
    const flattened = results.flatMap((result) => result);
    await Promise.all(flattened.map((doc) => buildPageDocs(doc)));

    const dedupedDocs = pageDocs.filter((doc) => {
      if (blacklist.has(doc.id) === false) {
        blacklist.add(doc.id);
        return true;
      }
      return false;
    });

    if (dedupedDocs.length <= 3) return [];

    const remoteIds: string[] = [];
    for (const doc of dedupedDocs) {
      try {
        if (remoteIds.length === 3) {
          const [first, second, third] = remoteIds;
          return [
            { text: { content: "Unlinked relations are " } },
            { mention: { page: { id: first } } },
            { text: { content: ", " } },
            { mention: { page: { id: second } } },
            { text: { content: ", and" } },
            { mention: { page: { id: third } } },
            { text: { content: "." } },
          ];
        }

        const page = await notion.pageRetrieve({ page_id: doc.id });
        if (page) remoteIds.push(page.id);
      } catch {
        // no op
      }
    }

    return [];
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
