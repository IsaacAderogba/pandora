import {
  DatabaseObjectResponse,
  PageObjectResponse,
  PartialDatabaseObjectResponse,
  PartialPageObjectResponse,
  CommentObjectResponse,
  PartialCommentObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

type DatabaseResponse = DatabaseObjectResponse | PartialDatabaseObjectResponse;
export type { DatabaseResponse, DatabaseObjectResponse };

type PageResponse = PageObjectResponse | PartialPageObjectResponse;
export type { PageResponse, PageObjectResponse };

type CommentResponse = CommentObjectResponse | PartialCommentObjectResponse;
export type { CommentResponse, CommentObjectResponse };

export type NotionResponse = DatabaseResponse | PageResponse | CommentResponse;

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
  GetPagePropertyResponse,
} from "@notionhq/client/build/src/api-endpoints";
