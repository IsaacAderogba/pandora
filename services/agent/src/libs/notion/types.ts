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
import { Doc } from "@prisma/client";

type DatabaseResponse = DatabaseObjectResponse | PartialDatabaseObjectResponse;
type DatabaseDoc = Doc & { data: DatabaseObjectResponse };
export type { DatabaseDoc, DatabaseResponse, DatabaseObjectResponse };

type PageResponse = PageObjectResponse | PartialPageObjectResponse;
type PageDoc = Doc & { data: PageObjectResponse };
export type { PageDoc, PageResponse, PageObjectResponse };

type BlockResponse = BlockObjectResponse | PartialBlockObjectResponse;
export type { BlockResponse, BlockObjectResponse };

type CommentResponse = CommentObjectResponse | PartialCommentObjectResponse;
type CommentDoc = Doc & { data: CommentObjectResponse };
export type { CommentDoc, CommentResponse, CommentObjectResponse };

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

// properties
