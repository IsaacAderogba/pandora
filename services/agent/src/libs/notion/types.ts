import {
  DatabaseObjectResponse,
  PageObjectResponse,
  PartialDatabaseObjectResponse,
  PartialPageObjectResponse,
  CommentObjectResponse,
  PartialCommentObjectResponse,
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

type DatabaseResponse = DatabaseObjectResponse | PartialDatabaseObjectResponse;
export type { DatabaseResponse, DatabaseObjectResponse };

type PageResponse = PageObjectResponse | PartialPageObjectResponse;
export type { PageResponse, PageObjectResponse };

type BlockResponse = BlockObjectResponse | PartialBlockObjectResponse;
export type { BlockResponse, BlockObjectResponse };

type CommentResponse = CommentObjectResponse | PartialCommentObjectResponse;
export type { CommentResponse, CommentObjectResponse };

export type NotionResponse =
  | DatabaseResponse
  | PageResponse
  | CommentResponse
  | BlockResponse;

export type PaginationResult<T> = {
  results: T[];
  next: string | null;
};

export type {
  SearchParameters,
  QueryDatabaseParameters,
  GetDatabaseParameters,
  GetPageParameters,
  GetPagePropertyParameters,
  ListCommentsParameters,
  ListBlockChildrenParameters,
  GetPagePropertyResponse,
} from "@notionhq/client/build/src/api-endpoints";
