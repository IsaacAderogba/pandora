import { upsertBlock } from "./models/documents/block";
import { upsertComment } from "./models/documents/comment";
import { upsertDatabase } from "./models/documents/database";
import { upsertPage } from "./models/documents/page";
import { notion } from "./libs/notion/client";
import { withError } from "./libs/sentry";

export const syncNotion = async () => {
  while (true) {
    await withError(async () => {
      await syncWorkspace();
    });
  }
};

const syncWorkspace = async () => {
  const databases = await notion.databaseListAll();

  for (const database of databases) {
    await withError(async () => {
      await syncDatabase(database.id, async (pageIds) => {
        await upsertDatabase(database, { pageIds });
      });
    });
  }
};

const syncDatabase = async (
  id: string,
  onSave: (pageIds: string[]) => Promise<void>
) => {
  const pages = await notion.pageListAll({ database_id: id });
  await onSave(pages.map((page) => page.id));

  for (const page of pages) {
    await withError(async () => {
      await syncDocTree(page.id, async (commentIds, blockIds) => {
        await upsertPage(page, { commentIds, blockIds });
      });
    });
  }
};

const syncDocTree = async (
  id: string,
  onSave: (commentIds: string[], blockIds: string[]) => Promise<void>
): Promise<void> => {
  const comments = await notion.commentListAll({ block_id: id });
  const blocks = await notion.blockListAll({ block_id: id });
  await onSave(
    comments.map((c) => c.id),
    blocks.map((b) => b.id)
  );

  // for (const comment of comments) {
  //   await withError(async () => {
  //     await upsertComment(comment);
  //   });
  // }

  for (const block of blocks) {
    await withError(async () => {
      await syncDocTree(block.id, async (commentIds, blockIds) => {
        await upsertBlock(block, { commentIds, blockIds });
      });
    });
  }
};
