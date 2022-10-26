import { $databaseDoc } from "../libs/notion/selectors";
import { DatabaseObjectResponse } from "../libs/notion/types";
import { upsertDoc } from "./base";

export const upsertDatabase = async (db: DatabaseObjectResponse) =>
  upsertDoc($databaseDoc(db));
