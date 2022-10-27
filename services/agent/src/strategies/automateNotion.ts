import { notion } from "../libs/notion/client";
import { DatabaseObjectResponse } from "../libs/notion/types";
import { captureError } from "../libs/sentry";
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
    try {
      const databases = await notion.databaseListAll();
      for (const database of databases) {
        await automateDatabase(database);
      }
    } catch (err) {
      captureError(err);
    }
  }
};

export const automateDatabase = async (database: DatabaseObjectResponse) => {
  try {
    await maybeRunStrategies(database, databaseStrategies);

    const pages = await notion.pageListAll({
      database_id: database.id,
      filter: {
        or: [
          {
            property: "Updated At",
            date: { after: getHourAgo().toISOString() },
          },
        ],
      },
    });

    for (const page of pages) {
      await maybeRunStrategies(page, pageStrategies);
      // todo
    }
  } catch (err) {
    captureError(err);
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
