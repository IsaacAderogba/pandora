import { $databaseDoc } from "../../libs/notion/selectors";
import { DatabaseDoc, DatabaseObjectResponse } from "../../libs/notion/types";
import { upsertDoc } from "./base";

export const upsertDatabase = async (
  db: DatabaseObjectResponse,
  metadata: DatabaseDoc["metadata"]
) => upsertDoc($databaseDoc(db, metadata));
