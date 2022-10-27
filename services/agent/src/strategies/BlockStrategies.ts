import { BlockObjectResponse } from "../libs/notion/types";
import { Strategy } from "./Strategy";

export type BlockStrategy = Strategy<BlockObjectResponse>;
