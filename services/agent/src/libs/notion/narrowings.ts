import { TitleProperty } from "./properties";
import {
  DatabaseObjectResponse,
  PageObjectResponse,
  CommentObjectResponse,
  BlockObjectResponse,
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

export const isBlockObjectResponse = (
  value: NotionResponse
): value is BlockObjectResponse => {
  if (value.object === "block") {
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

export const isPageTitleProperty = (
  prop: PageObjectResponse["properties"][""]
): prop is TitleProperty => prop.type === "title";
