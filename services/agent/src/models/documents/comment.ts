import { $commentDoc } from "../../libs/notion/selectors";
import { CommentObjectResponse } from "../../libs/notion/types";
import { upsertDoc } from "./base";

export const upsertComment = async (comment: CommentObjectResponse) =>
  upsertDoc($commentDoc(comment));