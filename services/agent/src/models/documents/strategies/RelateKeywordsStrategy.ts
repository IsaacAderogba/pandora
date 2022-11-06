import { isBlockDoc, isCommentDoc } from "../../../libs/notion/narrowings";
import { $pageStage } from "../../../libs/notion/selectors";
import { BlockDoc, CommentDoc, PageDoc } from "../../../libs/notion/types";
import { prisma } from "../../../libs/prisma";
import { PageStrategy } from "./Strategy";

export class RelateKeywordsStrategy implements PageStrategy {
  run: PageStrategy["run"] = async (_, page) => {
    if (this.shouldSkipStrategy(page)) return page;

    const childDocs = await this.fetchChildDocs(page);
    /**
     * Okay, so I have the updated page. What can I do with it?
     * 1. Make sure stage is not 0.
     * 2. Get all of its children and sub-children (don't need to be nested)
     * 3. Create document out of child docs
     */
    throw new Error("");
  };

  shouldSkipStrategy = ({ data }: PageDoc): boolean => {
    if ($pageStage(data)?.select?.name === "0") return true;
    return false;
  };

  fetchChildDocs = async (doc: PageDoc | BlockDoc): Promise<ContentDoc[]> => {
    const docs: ContentDoc[] = [];
    const ids = [...doc.metadata.blockIds, ...doc.metadata.commentIds];

    const results = await prisma.doc.findMany({ where: { id: { in: ids } } });
    for (const result of results) {
      if (isBlockDoc(result)) {
        docs.push(result, ...(await this.fetchChildDocs(result)));
      } else if (isBlockDoc(result) || isCommentDoc(result)) {
        docs.push(result);
      }
    }

    return docs;
  };

  createActionsDocument = () => {
    
  }
}

type ContentDoc = BlockDoc | CommentDoc;
