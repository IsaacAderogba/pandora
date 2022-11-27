import { notion } from "../../../libs/notion/client";
import {
  isBlockDoc,
  isCommentDoc,
  isDatabaseDoc,
  isPageDoc,
} from "../../../libs/notion/narrowings";
import {
  $blockText,
  $commentText,
  $pageRelation,
} from "../../../libs/notion/selectors";
import { BlockDoc, PageDoc } from "../../../libs/notion/types";
import { prisma } from "../../../libs/prisma";
import { KEYWORDS_DATABASE_ID } from "../../../utils/consts";
import { PageStrategy } from "./Strategy";

export class RelateKeywordsStrategy implements PageStrategy {
  loadedKeywords: LoadedKeywords = new Map();

  run: PageStrategy["run"] = async (_, page) => {
    await this.loadKeywords();

    if (page.parentId === KEYWORDS_DATABASE_ID) {
      this.loadedKeywords.set(page.id, page.title);
      return page;
    }

    const text = await this.loadText(page);
    const extractedIds = await this.extractKeywordIds(text);
    const existingKeywords = $pageRelation(page.data, "Keywords");
    const existingIds = new Set(existingKeywords.map((keyword) => keyword.id));
    if (this.keywordsHaventChanged(extractedIds, existingIds)) return page;

    const mergedIds = new Set([...existingIds, ...extractedIds]);
    if (mergedIds.size === 0 || mergedIds.size >= 25) return page;

    return this.updateKeywords(page, mergedIds);
  };

  loadKeywords = async () => {
    if (this.loadedKeywords.size !== 0) return;

    const keywords = await prisma.doc.findMany({
      where: { parentId: KEYWORDS_DATABASE_ID },
    });

    for (const keyword of keywords.filter(isPageDoc)) {
      this.loadedKeywords.set(keyword.id, keyword.title);
    }
  };

  loadText = async (doc: PageDoc | BlockDoc): Promise<string[]> => {
    const docs: string[] = [];
    const ids = [...doc.metadata.blockIds, ...doc.metadata.commentIds];

    const results = await prisma.doc.findMany({ where: { id: { in: ids } } });
    for (const result of results) {
      if (isBlockDoc(result)) {
        docs.push($blockText(result.data), ...(await this.loadText(result)));
      } else if (isCommentDoc(result)) {
        docs.push($commentText(result.data));
      }
    }

    return docs;
  };

  extractKeywordIds = async (text: string[]) => {
    const extractedIds = new Set<string>();
    const keywordsDb = await prisma.doc.findUnique({
      where: { id: KEYWORDS_DATABASE_ID },
    });

    if (!keywordsDb) return extractedIds;
    if (!isDatabaseDoc(keywordsDb)) return extractedIds;

    const eligibleIds = new Set(keywordsDb.metadata.pageIds);
    const joinedText = text.join(" ");

    for (const [id, keywordText] of this.loadedKeywords) {
      if (!eligibleIds.has(id)) continue;

      if (joinedText.includes(keywordText)) {
        extractedIds.add(id);
      }
    }

    return extractedIds;
  };

  keywordsHaventChanged = (
    extractedIds: Set<string>,
    existingIds: Set<string>
  ): boolean => {
    for (const id of extractedIds) {
      if (!existingIds.has(id)) return false;
    }

    return true;
  };

  updateKeywords = async (page: PageDoc, mergedIds: Set<string>) => {
    const data = await notion.pageUpdate({
      page_id: page.id,
      properties: {
        Keywords: {
          type: "relation",
          relation: [...mergedIds].map((id) => ({ id })),
        },
      },
    });

    const doc = await prisma.doc.update({
      where: { id: page.id },
      data: { data },
    });

    if (!isPageDoc(doc)) throw new Error("Expected page doc");
    return doc;
  };
}

type LoadedKeywords = Map<string, string>;
