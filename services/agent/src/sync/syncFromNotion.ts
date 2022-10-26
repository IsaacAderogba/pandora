import { upsertBlock } from "../documents/block";
import { upsertComment } from "../documents/comment";
import { upsertDatabase } from "../documents/database";
import { upsertPage } from "../documents/page";
import { notion } from "../libs/notion/client";

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
