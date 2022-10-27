import { $blockDoc } from "../libs/notion/selectors";
import { BlockDoc, BlockObjectResponse } from "../libs/notion/types";
import { upsertDoc } from "./base";

export const upsertBlock = async (
  block: BlockObjectResponse,
  metadata: BlockDoc["metadata"]
) => upsertDoc($blockDoc(block, metadata));
