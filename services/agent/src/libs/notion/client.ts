import { Client } from "@notionhq/client";
import { RateLimiterMemory, rateLimiter, rateLimit } from "../rateLimiter";
import {
  isCommentObjectResponse,
  isDatabaseObjectResponse,
  isPageObjectResponse,
} from "./narrowings";
import {
  DatabaseObjectResponse,
  PageObjectResponse,
  SearchParameters,
  QueryDatabaseParameters,
  GetDatabaseParameters,
  ListCommentsParameters,
  CommentObjectResponse,
  PaginationResult,
} from "./types";

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
  async databasesSearch(
    params: Omit<SearchParameters, "filter"> = {}
  ): Promise<PaginationResult<DatabaseObjectResponse>> {
    const { results, next_cursor } = await this.client.search({
      ...params,
      filter: { property: "object", value: "database" },
    });

    return {
      results: results.filter(isDatabaseObjectResponse),
      next: next_cursor,
    };
  }

  @rateLimit(1)
  async databasesRetrieve(
    params: GetDatabaseParameters
  ): Promise<DatabaseObjectResponse> {
    const result = await this.client.databases.retrieve(params);
    if (!isDatabaseObjectResponse(result)) {
      throw this.error("Expected database response object");
    }

    return result;
  }

  @rateLimit(1)
  async databasesQuery(
    params: QueryDatabaseParameters
  ): Promise<PaginationResult<PageObjectResponse>> {
    const { results, next_cursor } = await this.client.databases.query(params);
    return {
      results: results.filter(isPageObjectResponse),
      next: next_cursor,
    };
  }

  @rateLimit(1)
  async commentsList(
    params: ListCommentsParameters
  ): Promise<PaginationResult<CommentObjectResponse>> {
    const { results, next_cursor } = await this.client.comments.list(params);
    return {
      results: results.filter(isCommentObjectResponse),
      next: next_cursor,
    };
  }

  private error(message: string) {
    return new Error(message);
  }
}

export const notion = new Notion();
