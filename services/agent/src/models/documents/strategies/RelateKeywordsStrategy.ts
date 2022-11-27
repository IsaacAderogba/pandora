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
  loadedKeywords: Map<string, string> = new Map();

  run: PageStrategy["run"] = async (_, page) => {
    if (!page.data.properties["Keywords"]) return page;
    await this.loadKeywords();

    if (page.parentId === KEYWORDS_DATABASE_ID) {
      this.loadedKeywords.set(page.id, page.title);
      return page;
    }

    const text = await this.loadText(page);
    const { extractedIds, eligibleIds } = await this.extractKeywordIds(text);
    const existingKeywords = $pageRelation(page.data, "Keywords");
    const existingIds = new Set(existingKeywords.map((keyword) => keyword.id));

    if (this.keywordsHaventChanged(extractedIds, existingIds)) return page;

    const mergedIds = new Set([...existingIds, ...extractedIds]);
    return this.updateKeywords(page, mergedIds, eligibleIds);
  };

  loadKeywords = async () => {
    if (this.loadedKeywords.size !== 0) return;

    const keywords = await prisma.doc.findMany({
      where: { parentId: KEYWORDS_DATABASE_ID },
    });

    for (const keyword of keywords.filter(isPageDoc)) {
      this.loadedKeywords.set(keyword.id, keyword.title.toLowerCase());
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
    const eligibleIds = new Set<string>();
    const keywordsDb = await prisma.doc.findUnique({
      where: { id: KEYWORDS_DATABASE_ID },
    });

    if (!keywordsDb) return { extractedIds, eligibleIds };
    if (!isDatabaseDoc(keywordsDb)) return { extractedIds, eligibleIds };

    keywordsDb.metadata.pageIds.forEach((id) => eligibleIds.add(id));
    const joinedText = text.join(" ").toLowerCase();

    for (const [id, keywordText] of this.loadedKeywords) {
      if (!eligibleIds.has(id)) continue;

      if (joinedText.includes(keywordText)) {
        extractedIds.add(id);
      }
    }

    return { extractedIds, eligibleIds };
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

  updateKeywords = async (
    page: PageDoc,
    mergedIds: Set<string>,
    eligibleIds: Set<string>
  ): Promise<PageDoc> => {
    const relation = [...mergedIds]
      .filter((id) => eligibleIds.has(id))
      .map((id) => ({ id }));
    if (relation.length === 0 || relation.length >= 25) return page;

    const doc = await prisma.doc.update({
      where: { id: page.id },
      data: {
        data: await notion.pageUpdate({
          page_id: page.id,
          properties: { Keywords: { type: "relation", relation } },
        }),
      },
    });

    if (!isPageDoc(doc)) throw new Error("Expected page doc");
    return doc;
  };
}
