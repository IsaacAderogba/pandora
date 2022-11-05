import { upsertBlock } from "./models/documents/block";
import { upsertComment } from "./models/documents/comment";
import { upsertDatabase } from "./models/documents/database";
import { upsertPage } from "./models/documents/page";
import { notion } from "./libs/notion/client";
import { $databaseTitle } from "./libs/notion/selectors";
import { withError } from "./libs/sentry";
import { BlockStrategy } from "./models/documents/BlockStrategies";
import { CommentStrategy } from "./models/documents/CommentStrategies";
import { DatabaseStrategy } from "./models/documents/DatabaseStrategies";
import { PageStrategy } from "./models/documents/PageStrategies";
import { Strategy } from "./models/documents/BaseStrategy";

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

  for (const database of databases.filter(
    (db) => $databaseTitle(db) === "Tasks"
  )) {
    await withError(async () => {
      await automateDatabase(database.id, databaseStrategies, async (pageIds) =>
        upsertDatabase(database, { pageIds })
      );
    });
  }
};

const automateDatabase = async <T>(
  id: string,
  strategies: Strategy<T>[],
  onSave: (pageIds: string[]) => Promise<T>
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

  const saved = await onSave(pages.map((page) => page.id));
  for (const page of pages) {
    await withError(async () => {
      await automateDocTree(
        page.id,
        pageStrategies,
        async (commentIds, blockIds) =>
          upsertPage(page, { commentIds, blockIds })
      );
    });
  }

  await maybeRunStrategies(saved, strategies);
};

const automateDocTree = async <T>(
  id: string,
  strategies: Strategy<T>[],
  onSave: (commentIds: string[], blockIds: string[]) => Promise<T>
): Promise<void> => {
  const comments = await notion.commentListAll({ block_id: id });
  const blocks = await notion.blockListAll({ block_id: id });
  const saved = await onSave(
    comments.map((c) => c.id),
    blocks.map((b) => b.id)
  );

  for (const comment of comments) {
    await withError(async () => {
      const saved = await upsertComment(comment);
      await maybeRunStrategies(saved, commentStrategies);
    });
  }

  for (const block of blocks) {
    await withError(async () => {
      await automateDocTree(
        block.id,
        blockStrategies,
        async (commentIds, blockIds) =>
          upsertBlock(block, { commentIds, blockIds })
      );
    });
  }

  await maybeRunStrategies(saved, strategies);
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
