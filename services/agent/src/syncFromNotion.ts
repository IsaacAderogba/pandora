import { notion } from "./libs/notion/client";
import {
  $blockDoc,
  $commentDoc,
  $databaseDoc,
  $pageDoc,
} from "./libs/notion/selectors";
import {
  BlockDoc,
  BlockObjectResponse,
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
        await syncDocumentTree(page.id, async (commentIds, blockIds) => {
          await upsertPage(page, { commentIds, blockIds });
        });
      }
    }
  }
};

const syncDocumentTree = async (
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
    await syncDocumentTree(block.id, async (commentIds, blockIds) => {
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
  console.log(`[${doc.type.toLowerCase()}-upserted]: ${doc.title}`);
  return doc;
};
