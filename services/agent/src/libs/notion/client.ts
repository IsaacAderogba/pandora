import { Client } from "@notionhq/client";
import { rateLimiter, rateLimit } from "../rateLimiter";
import { notionLimiter } from "./limiter";
import {
  isBlockObjectResponse,
  isCommentObjectResponse,
  isDatabaseObjectResponse,
  isPageObjectResponse,
} from "./narrowings";
import {
  DatabaseObjectResponse,
  PageObjectResponse,
  BlockObjectResponse,
  SearchParameters,
  QueryDatabaseParameters,
  GetDatabaseParameters,
  ListCommentsParameters,
  ListBlockChildrenParameters,
  GetPageParameters,
  GetPagePropertyParameters,
  CommentObjectResponse,
  PaginationResult,
  GetPagePropertyResponse,
} from "./types";

@rateLimiter(notionLimiter)
class Notion {
  client = new Client({
    auth: process.env.NOTION_SECRET,
    notionVersion: "2022-06-28",
  });

  async databaseListAll(
    params: Omit<SearchParameters, "filter"> = {}
  ): Promise<DatabaseObjectResponse[]> {
    return this.listAll((start_cursor) =>
      this.databaseList({ ...params, start_cursor })
    );
  }

  @rateLimit({ points: 1 })
  async databaseList(
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

  @rateLimit({ points: 1 })
  async databaseRetrieve(
    params: GetDatabaseParameters
  ): Promise<DatabaseObjectResponse> {
    const result = await this.client.databases.retrieve(params);
    if (!isDatabaseObjectResponse(result)) {
      throw this.error("Expected database response object");
    }

    return result;
  }

  async pageListAll(
    params: QueryDatabaseParameters
  ): Promise<PageObjectResponse[]> {
    return this.listAll((start_cursor) =>
      this.pageList({ ...params, start_cursor })
    );
  }

  @rateLimit({ points: 1 })
  async pageList(
    params: QueryDatabaseParameters
  ): Promise<PaginationResult<PageObjectResponse>> {
    const { results, next_cursor } = await this.client.databases.query(params);
    return {
      results: results.filter(isPageObjectResponse),
      next: next_cursor,
    };
  }

  @rateLimit({ points: 1 })
  async pageRetrieve(params: GetPageParameters): Promise<PageObjectResponse> {
    const result = await this.client.pages.retrieve(params);
    if (!isPageObjectResponse(result)) {
      throw this.error("Expected page response object");
    }

    return result;
  }

  @rateLimit({ points: 1 })
  async propertyRetrieve(
    params: GetPagePropertyParameters
  ): Promise<GetPagePropertyResponse> {
    return await this.client.pages.properties.retrieve(params);
  }

  async blockListAll(
    params: ListBlockChildrenParameters
  ): Promise<BlockObjectResponse[]> {
    return this.listAll((start_cursor) =>
      this.blockList({ ...params, start_cursor })
    );
  }

  @rateLimit({ points: 1 })
  async blockList(
    params: ListBlockChildrenParameters
  ): Promise<PaginationResult<BlockObjectResponse>> {
    const { results, next_cursor } = await this.client.blocks.children.list(
      params
    );

    return {
      results: results.filter(isBlockObjectResponse),
      next: next_cursor,
    };
  }

  async commentListAll(
    params: ListCommentsParameters
  ): Promise<CommentObjectResponse[]> {
    return this.listAll((start_cursor) =>
      this.commentList({ ...params, start_cursor })
    );
  }

  @rateLimit({ points: 1 })
  async commentList(
    params: ListCommentsParameters
  ): Promise<PaginationResult<CommentObjectResponse>> {
    const { results, next_cursor } = await this.client.comments.list(params);
    return {
      results: results.filter(isCommentObjectResponse),
      next: next_cursor,
    };
  }

  async listAll<T>(
    loadMore: (cursor: string | undefined) => Promise<PaginationResult<T>>
  ) {
    const documents: T[] = [];
    let start_cursor: string | undefined;

    do {
      const result = await loadMore(start_cursor);
      documents.push(...result.results);
      if (result.next) start_cursor = result.next;
    } while (start_cursor);

    return documents;
  }

  private error(message: string) {
    return new Error(message);
  }
}

export const notion = new Notion();
