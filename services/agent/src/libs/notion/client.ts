import { Client } from "@notionhq/client";
import { RateLimiterMemory, rateLimiter, rateLimit } from "../rateLimiter";
import { isDatabaseObjectResponse } from "./narrowings";
import { DatabaseObjectResponse, SearchParameters } from "./types";

const limiter = new RateLimiterMemory({
  points: 1,
  duration: 1,
  keyPrefix: "notion-rate-limiter",
});

@rateLimiter(limiter)
class Notion {
  client = new Client({
    auth: process.env.NOTION_SECRET,
    notionVersion: "2022-06-28",
  });

  @rateLimit(1)
  async searchDatabases(
    params: Omit<SearchParameters, "filter"> = {}
  ): Promise<DatabaseObjectResponse[]> {
    const { results } = await this.client.search({
      ...params,
      filter: { property: "object", value: "database" },
    });

    return results.filter(isDatabaseObjectResponse);
  }
}

export const notion = new Notion();
