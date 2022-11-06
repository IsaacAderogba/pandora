import { SelectProperty, TitleProperty } from "./properties";
import {
  DatabaseObjectResponse,
  PageObjectResponse,
  CommentObjectResponse,
  BlockObjectResponse,
  DocResponse,
} from "./types";

export const isDatabaseObjectResponse = (
  value: DocResponse
): value is DatabaseObjectResponse => {
  if (value.object === "database") {
    if ("parent" in value) return true;
  }

  return false;
};

export const isPageObjectResponse = (
  value: DocResponse
): value is PageObjectResponse => {
  if (value.object === "page") {
    if ("parent" in value) return true;
  }

  return false;
};

export const isBlockObjectResponse = (
  value: DocResponse
): value is BlockObjectResponse => {
  if (value.object === "block") {
    if ("parent" in value) return true;
  }

  return false;
};

export const isCommentObjectResponse = (
  value: DocResponse
): value is CommentObjectResponse => {
  if (value.object === "comment") {
    if ("parent" in value) return true;
  }

  return false;
};

export const isPageTitleProperty = (
  prop: PageObjectResponse["properties"][""]
): prop is TitleProperty => prop.type === "title";

export const isPageSelectProperty = (
  prop: PageObjectResponse["properties"][""]
): prop is SelectProperty => prop.type === "select";
