import { upsertBlock } from "../documents/block";
import { upsertComment } from "../documents/comment";
import { upsertDatabase } from "../documents/database";
import { upsertPage } from "../documents/page";
import { notion } from "../libs/notion/client";
import { $databaseTitle } from "../libs/notion/selectors";
import { withError } from "../libs/sentry";
import { BlockStrategy } from "./BlockStrategies";
import { CommentStrategy } from "./CommentStrategies";
import { DatabaseStrategy } from "./DatabaseStrategies";
import { PageStrategy } from "./PageStrategies";
import { Strategy } from "./Strategy";

const databaseStrategies: DatabaseStrategy[] = [];
const pageStrategies: PageStrategy[] = [];
const blockStrategies: BlockStrategy[] = [];
const commentStrategies: CommentStrategy[] = [];

export const automateNotion = async () => {
  while (true) {
    await withError(async () => {
      await automateWorkspace();
    });
  }
};

const automateWorkspace = async () => {
  const databases = await notion.databaseListAll({});

  for (const database of databases.filter(db => $databaseTitle(db) === "Tasks")) {
    await withError(async () => {
      await automateDatabase(database.id, async (pageIds) => {
        const initial = await upsertDatabase(database, { pageIds });
        await maybeRunStrategies(initial, databaseStrategies);
      });
    });
  }
};

const automateDatabase = async (
  id: string,
  onSave: (pageIds: string[]) => Promise<void>
) => {
  const pages = await notion.pageListAll({
    database_id: id,
    filter: {
      or: [
        {
          property: "Updated At",
          date: { after: getHourAgo().toISOString() },
        },
      ],
    },
  });
  await onSave(pages.map((page) => page.id));

  for (const page of pages) {
    await withError(async () => {
      await automateDocTree(page.id, async (commentIds, blockIds) => {
        const initial = await upsertPage(page, { commentIds, blockIds });
        await maybeRunStrategies(initial, pageStrategies);
      });
    });
  }
};

const automateDocTree = async (
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
    await withError(async () => {
      const initial = await upsertComment(comment);
      await maybeRunStrategies(initial, commentStrategies);
    });
  }

  for (const block of blocks) {
    await withError(async () => {
      await automateDocTree(block.id, async (commentIds, blockIds) => {
        const initial = await upsertBlock(block, { commentIds, blockIds });
        await maybeRunStrategies(initial, blockStrategies);
      });
    });
  }
};

const maybeRunStrategies = async <T>(
  initial: T,
  strategies: Strategy<T>[]
): Promise<{ value: T; ran: boolean }> => {
  let value = initial;
  for (const strategy of strategies) {
    value = await strategy.run(initial, value);
  }

  return { value, ran: true };
};

const getHourAgo = () => new Date(Date.now() - 1000 * 60 * 60);
