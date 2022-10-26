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

  async databaseRecursivelyList(
    params: Omit<SearchParameters, "filter"> = {}
  ): Promise<DatabaseObjectResponse[]> {
    const documents: DatabaseObjectResponse[] = [];
    let start_cursor: string | undefined;

    do {
      const result = await this.databaseList({ ...params, start_cursor });
      documents.push(...result.results);
      if (result.next) start_cursor = result.next;
    } while (start_cursor);

    return documents;
  }

  @rateLimit(1)
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

  @rateLimit(1)
  async databaseRetrieve(
    params: GetDatabaseParameters
  ): Promise<DatabaseObjectResponse> {
    const result = await this.client.databases.retrieve(params);
    if (!isDatabaseObjectResponse(result)) {
      throw this.error("Expected database response object");
    }

    return result;
  }

  async pageRecursivelyList(
    params: QueryDatabaseParameters
  ): Promise<PageObjectResponse[]> {
    const documents: PageObjectResponse[] = [];
    let start_cursor: string | undefined;

    do {
      const result = await this.pageList({ ...params, start_cursor });
      documents.push(...result.results);
      if (result.next) start_cursor = result.next;
    } while (start_cursor);

    return documents;
  }

  @rateLimit(1)
  async pageList(
    params: QueryDatabaseParameters
  ): Promise<PaginationResult<PageObjectResponse>> {
    const { results, next_cursor } = await this.client.databases.query(params);
    return {
      results: results.filter(isPageObjectResponse),
      next: next_cursor,
    };
  }

  @rateLimit(1)
  async pageRetrieve(params: GetPageParameters): Promise<PageObjectResponse> {
    const result = await this.client.pages.retrieve(params);
    if (!isPageObjectResponse(result)) {
      throw this.error("Expected page response object");
    }

    return result;
  }

  @rateLimit(1)
  async propertyRetrieve(
    params: GetPagePropertyParameters
  ): Promise<GetPagePropertyResponse> {
    return await this.client.pages.properties.retrieve(params);
  }

  async blockRecursivelyList(
    params: ListBlockChildrenParameters
  ): Promise<BlockObjectResponse[]> {
    const documents: BlockObjectResponse[] = [];
    let start_cursor: string | undefined;

    do {
      const result = await this.blockList({ ...params, start_cursor });
      documents.push(...result.results);
      if (result.next) start_cursor = result.next;
    } while (start_cursor);

    return documents;
  }

  @rateLimit(1)
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

  async commentRecursivelyList(
    params: ListCommentsParameters
  ): Promise<CommentObjectResponse[]> {
    const documents: CommentObjectResponse[] = [];
    let start_cursor: string | undefined;

    do {
      const result = await this.commentList({ ...params, start_cursor });
      documents.push(...result.results);
      if (result.next) start_cursor = result.next;
    } while (start_cursor);

    return documents;
  }

  @rateLimit(1)
  async commentList(
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
