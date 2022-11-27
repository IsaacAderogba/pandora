import { upsertBlock } from "./models/documents/block";
import { upsertComment } from "./models/documents/comment";
import { upsertDatabase } from "./models/documents/database";
import { upsertPage } from "./models/documents/page";
import { notion } from "./libs/notion/client";
import { withError } from "./libs/sentry";
import {
  Strategy,
  BlockStrategy,
  CommentStrategy,
  DatabaseStrategy,
  PageStrategy,
} from "./models/documents/strategies/Strategy";
import { SuggestKeywordsStrategy } from "./models/documents/strategies/SuggestKeywordsStrategy";
import { TabulatePapersStrategy } from "./models/documents/strategies/TabulatePapersStrategy";
import { RelateKeywordsStrategy } from "./models/documents/strategies/RelateKeywordsStrategy";
import { prisma } from "./libs/prisma";
import { isDatabaseDoc } from "./libs/notion/narrowings";
import { uniq } from "lodash";
import { RelatePagesStrategy } from "./models/documents/strategies/RelatePagesStrategy";

const databaseStrategies: DatabaseStrategy[] = [];
const pageStrategies: PageStrategy[] = [
  new SuggestKeywordsStrategy(),
  new RelateKeywordsStrategy(),
  // new RelatePagesStrategy(),
  // new SuggestPagesStrategy(),
  // new TabulatePapersStrategy(),
];
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

  for (const db of databases) {
    await withError(async () => {
      await automateDatabase(db.id, databaseStrategies, async (pageIds) => {
        const prevDb = await prisma.doc.findUnique({ where: { id: db.id } });
        if (prevDb && isDatabaseDoc(prevDb)) {
          pageIds = uniq([...prevDb.metadata.pageIds, ...pageIds]);
        }
        return upsertDatabase(db, { pageIds });
      });
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
          await upsertPage(page, { commentIds, blockIds }, id)
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
    const saved = await upsertComment(comment, id);
    await withError(async () => {
      await maybeRunStrategies(saved, commentStrategies);
    });
  }

  for (const block of blocks) {
    await withError(async () => {
      await automateDocTree(
        block.id,
        blockStrategies,
        async (commentIds, blockIds) =>
          await upsertBlock(block, { commentIds, blockIds }, id)
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
