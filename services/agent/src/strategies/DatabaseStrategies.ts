import { DatabaseObjectResponse } from "../libs/notion/types";
import { Strategy } from "./Strategy";

export type DatabaseStrategy = Strategy<DatabaseObjectResponse>;
