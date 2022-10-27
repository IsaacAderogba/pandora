import {
  BlockObjectResponse,
  CommentObjectResponse,
  DatabaseObjectResponse,
  DocObjectResponse,
  PageObjectResponse,
} from "../libs/notion/types";

export interface Strategy<T> {
  run: (initial: T, accumulated: T) => T | Promise<T>;
}

export type DocStrategy = Strategy<DocObjectResponse>;
export type DatabaseStrategy = Strategy<DatabaseObjectResponse>;
export type PageStrategy = Strategy<PageObjectResponse>;
export type BlockStrategy = Strategy<BlockObjectResponse>;
export type CommentStrategy = Strategy<CommentObjectResponse>;
