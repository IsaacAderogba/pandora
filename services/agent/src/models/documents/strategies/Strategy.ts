import { BlockDoc, CommentDoc, DatabaseDoc, PageDoc } from "../../../libs/notion/types";

export interface Strategy<T> {
  run: (initial: T, accumulated: T) => T | Promise<T>;
}

export type BlockStrategy = Strategy<BlockDoc>;
export type CommentStrategy = Strategy<CommentDoc>;
export type DatabaseStrategy = Strategy<DatabaseDoc>;
export type PageStrategy = Strategy<PageDoc>;


