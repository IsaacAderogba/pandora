import {
  BlockResponse,
  CommentResponse,
  DatabaseResponse,
  DocResponse,
  PageResponse,
} from "../libs/notion/types";

interface Strategy<T> {
  run: (initial: T, accumulated: T) => T | Promise<T>;
}

export type DocStrategy = Strategy<DocResponse>;
export type DatabaseStrategy = Strategy<DatabaseResponse>;
export type PageStrategy = Strategy<PageResponse>;
export type BlockStrategy = Strategy<BlockResponse>;
export type CommentStrategy = Strategy<CommentResponse>;
