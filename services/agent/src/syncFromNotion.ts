import { notion } from "./libs/notion/client";
import { $commentDoc, $databaseDoc, $pageDoc } from "./libs/notion/selectors";
import {
  BlockDoc,
  CommentDoc,
  CommentObjectResponse,
  DatabaseDoc,
  DatabaseObjectResponse,
  PageDoc,
  PageObjectResponse,
} from "./libs/notion/types";
import { prisma } from "./libs/prisma";

export const syncFromNotion = async () => {
  while (true) {
    for (const db of await notion.databaseListAll()) {
      const dbDoc = await upsertDatabase(db);

      for (const page of await notion.pageListAll({ database_id: dbDoc.id })) {
        const pageDoc = await upsertPage(page);
        await syncDocumentTree(pageDoc.id);
      }
    }
  }
};

const syncDocumentTree = async (id: string): Promise<void> => {
  const comments = await notion.commentListAll({ block_id: id });
  for (const [order, comment] of comments.entries()) {
    await upsertComment(comment, { order });
  }

  const blocks = await notion.blockListAll({ block_id: id });
  // for (const [order, block] of blocks.entries()) {
  //   await upsertBlock(block, { order });
  // }
};

const upsertDatabase = async (db: DatabaseObjectResponse) =>
  upsertDoc($databaseDoc(db));

const upsertPage = async (page: PageObjectResponse) =>
  upsertDoc($pageDoc(page));

const upsertComment = async (
  comment: CommentObjectResponse,
  metadata: CommentDoc["metadata"]
) => upsertDoc($commentDoc(comment, metadata));

const upsertDoc = async <
  T extends DatabaseDoc | PageDoc | CommentDoc | BlockDoc
>(
  doc: T
): Promise<T> => {
  await prisma.doc.upsert({
    where: { id: doc.id },
    create: doc,
    update: doc,
  });
  console.log(`[${doc.type.toLowerCase()}-upserted]: ${doc.title}`);
  return doc;
};
