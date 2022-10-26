import { notion } from "../libs/notion/client";
import {
  $blockDoc,
  $commentDoc,
  $databaseDoc,
  $pageDoc,
} from "../libs/notion/selectors";
import {
  BlockDoc,
  BlockObjectResponse,
  CommentDoc,
  CommentObjectResponse,
  DatabaseDoc,
  DatabaseObjectResponse,
  PageDoc,
  PageObjectResponse,
} from "../libs/notion/types";
import { prisma } from "../libs/prisma";

class SyncFromNotion {
  
}

export const syncFromNotion = async () => {
  while (true) {
    const databases = await notion.databaseListAll();
    for (const db of databases) {
      await upsertDatabase(db);

      const pages = await notion.pageListAll({ database_id: db.id });
      for (const page of pages) {
        await syncTree(page.id, async (commentIds, blockIds) => {
          await upsertPage(page, { commentIds, blockIds });
        });
      }
    }
  }
};

const syncTree = async (
  id: string,
  onSave: (commentIds: string[], blockIds: string[]) => Promise<void>
): Promise<void> => {
  const comments = await notion.commentListAll({ block_id: id });
  const blocks = await notion.blockListAll({ block_id: id });
  await onSave(
    comments.map((c) => c.id),
    blocks.map((b) => b.id)
  );

  for (const comment of comments) {
    await upsertComment(comment);
  }

  for (const block of blocks) {
    await syncTree(block.id, async (commentIds, blockIds) => {
      await upsertBlock(block, { commentIds, blockIds });
    });
  }
};

const upsertDatabase = async (db: DatabaseObjectResponse) =>
  upsertDoc($databaseDoc(db));

const upsertPage = async (
  page: PageObjectResponse,
  metadata: PageDoc["metadata"]
) => upsertDoc($pageDoc(page, metadata));

const upsertBlock = async (
  block: BlockObjectResponse,
  metadata: BlockDoc["metadata"]
) => upsertDoc($blockDoc(block, metadata));

const upsertComment = async (comment: CommentObjectResponse) =>
  upsertDoc($commentDoc(comment));

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

  const header = `[${doc.type.toLowerCase()}-upserted]`;
  const label = `${new Date().toISOString()} ${doc.title}`;
  console.log(`${header}: ${label}`);
  return doc;
};
