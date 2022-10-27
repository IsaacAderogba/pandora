import { CommentObjectResponse } from "../libs/notion/types";
import { Strategy } from "./Strategy";

export type CommentStrategy = Strategy<CommentObjectResponse>;
