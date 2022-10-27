import { upsertBlock } from "../documents/block";
import { upsertComment } from "../documents/comment";
import { upsertDatabase } from "../documents/database";
import { upsertPage } from "../documents/page";
import { notion } from "../libs/notion/client";
import { DatabaseObjectResponse } from "../libs/notion/types";
import { captureError } from "../libs/sentry";

class SyncFromNotion {
  start = async () => {
    while (true) {
      try {
        await this.syncWorkspace();
      } catch (err) {
        captureError(err);
      }
    }
  };

  private syncWorkspace = async () => {
    const databases = await notion.databaseListAll();

    for (const database of databases) {
      try {
        await this.syncDatabase(database);
      } catch (err) {
        captureError(err);
      }
    }
  };

  private syncDatabase = async (db: DatabaseObjectResponse) => {
    await upsertDatabase(db);
    const pages = await notion.pageListAll({ database_id: db.id });

    for (const page of pages) {
      try {
        await this.syncDocTree(page.id, async (commentIds, blockIds) => {
          await upsertPage(page, { commentIds, blockIds });
        });
      } catch (err) {
        captureError(err);
      }
    }
  };

  private syncDocTree = async (
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
      try {
        await this.syncDocTree(block.id, async (commentIds, blockIds) => {
          await upsertBlock(block, { commentIds, blockIds });
        });
      } catch (err) {
        captureError(err);
      }
    }
  };
}

export const syncFromNotion = new SyncFromNotion();
