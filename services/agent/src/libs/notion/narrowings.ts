import {
  DatabaseObjectResponse,
  PageObjectResponse,
  CommentObjectResponse,
  NotionResponse,
} from "./types";

export const isDatabaseObjectResponse = (
  value: NotionResponse
): value is DatabaseObjectResponse => {
  if (value.object === "database") {
    if ("parent" in value) return true;
  }

  return false;
};

export const isPageObjectResponse = (
  value: NotionResponse
): value is PageObjectResponse => {
  if (value.object === "page") {
    if ("parent" in value) return true;
  }

  return false;
};

export const isCommentObjectResponse = (
  value: NotionResponse
): value is CommentObjectResponse => {
  if (value.object === "comment") {
    if ("parent" in value) return true;
  }

  return false;
};
