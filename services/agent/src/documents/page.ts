import { $pageDoc } from "../libs/notion/selectors";
import { PageDoc, PageObjectResponse } from "../libs/notion/types";
import { upsertDoc } from "./base";

export const upsertPage = async (
  page: PageObjectResponse,
  metadata: PageDoc["metadata"]
) => upsertDoc($pageDoc(page, metadata));
