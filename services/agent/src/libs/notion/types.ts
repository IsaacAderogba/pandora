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
type DatabaseDoc = Document<DatabaseObjectResponse, { pageIds: string[] }>;
export type { DatabaseDoc, DatabaseResponse, DatabaseObjectResponse };

type PageResponse = PageObjectResponse | PartialPageObjectResponse;
type PageDoc = Document<
  PageObjectResponse,
  { commentIds: string[]; blockIds: string[] }
>;
export type { PageDoc, PageResponse, PageObjectResponse };

type BlockResponse = BlockObjectResponse | PartialBlockObjectResponse;
type BlockDoc = Document<
  BlockObjectResponse,
  { commentIds: string[]; blockIds: string[] }
>;
export type { BlockDoc, BlockResponse, BlockObjectResponse };

type CommentResponse = CommentObjectResponse | PartialCommentObjectResponse;
type CommentDoc = Document<CommentObjectResponse>;

export type { CommentDoc, CommentResponse, CommentObjectResponse };

type Document<T, K = {}> = Omit<Doc, "data" | "metadata"> & {
  data: T;
  metadata: K;
};

export type DocObjectResponse =
  | DatabaseObjectResponse
  | PageObjectResponse
  | CommentObjectResponse
  | BlockObjectResponse;

export type DocResponse =
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
  RichTextItemResponse,
  CreatePageParameters,
  UpdatePageParameters,
  UpdateBlockParameters,
  AppendBlockChildrenParameters,
  DeleteBlockParameters,
  CreateCommentParameters,
} from "@notionhq/client/build/src/api-endpoints";
