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
type DatabaseDoc = Document<DatabaseObjectResponse>;
export type { DatabaseDoc, DatabaseResponse, DatabaseObjectResponse };

type PageResponse = PageObjectResponse | PartialPageObjectResponse;
type PageDoc = Document<PageObjectResponse>;
export type { PageDoc, PageResponse, PageObjectResponse };

type BlockResponse = BlockObjectResponse | PartialBlockObjectResponse;
type BlockDoc = Document<BlockObjectResponse, { order: number }>;
export type { BlockDoc, BlockResponse, BlockObjectResponse };

type CommentResponse = CommentObjectResponse | PartialCommentObjectResponse;
type CommentDoc = Document<CommentObjectResponse, { order: number }>;

export type { CommentDoc, CommentResponse, CommentObjectResponse };

type Document<T, K = {}> = Omit<Doc, "data" | "metadata"> & {
  data: T;
  metadata: K;
};

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
