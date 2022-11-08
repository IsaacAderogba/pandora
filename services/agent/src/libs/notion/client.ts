import { Client } from "@notionhq/client";
import { rateLimiter, rateLimit } from "../limiter";
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
  CreatePageParameters,
  UpdateBlockParameters,
  AppendBlockChildrenParameters,
  DeleteBlockParameters,
  UpdatePageParameters,
  CreateCommentParameters
} from "./types";

@rateLimiter({ duration: 1000, points: 1 })
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

  async pageFindExternal(
    databaseId: string,
    externalId: string
  ): Promise<PageObjectResponse | undefined> {
    const { results } = await notion.pageList({
      database_id: databaseId,
      filter: {
        property: "External Id",
        rich_text: { contains: externalId },
      },
    });

    return results[0];
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
  async pageCreate(params: CreatePageParameters): Promise<PageObjectResponse> {
    const result = await this.client.pages.create(params);
    if (!isPageObjectResponse(result)) {
      throw this.error("Expected page response object");
    }
    return result;
  }

  @rateLimit({ points: 1 })
  async pageUpdate(params: UpdatePageParameters): Promise<PageObjectResponse> {
    const result = await this.client.pages.update(params);
    if (!isPageObjectResponse(result)) {
      throw this.error("Expected page response object");
    }
    return result;
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

  @rateLimit({ points: 1 })
  async blockAppend(
    params: AppendBlockChildrenParameters
  ): Promise<PaginationResult<BlockObjectResponse>> {
    const { results, next_cursor } = await this.client.blocks.children.append(
      params
    );

    return {
      results: results.filter(isBlockObjectResponse),
      next: next_cursor,
    };
  }

  @rateLimit({ points: 1 })
  async blockUpdate(
    params: UpdateBlockParameters
  ): Promise<BlockObjectResponse> {
    const result = await this.client.blocks.update(params);
    if (!isBlockObjectResponse(result)) {
      throw this.error("Expected block response object");
    }

    return result;
  }

  @rateLimit({ points: 1 })
  async blockDelete(
    params: DeleteBlockParameters
  ): Promise<BlockObjectResponse> {
    const result = await this.client.blocks.delete(params);
    if (!isBlockObjectResponse(result)) {
      throw this.error("Expected block response object");
    }

    return result;
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

  @rateLimit({ points: 1 })
  async commentCreate(params: CreateCommentParameters): Promise<CommentObjectResponse> {
    const result = await this.client.comments.create(params);
    if (!isCommentObjectResponse(result)) {
      throw this.error("Expected comment response object");
    }
    return result;
  }

  private async listAll<T>(
    loadMore: (cursor: string | undefined) => Promise<PaginationResult<T>>
  ) {
    const documents: T[] = [];
    let start_cursor: string | undefined | null;

    do {
      const result = await loadMore(start_cursor ?? undefined);
      documents.push(...result.results);
      start_cursor = result.next;
    } while (start_cursor);

    return documents;
  }

  private error(message: string) {
    return new Error(message);
  }
}

export const notion = new Notion();
