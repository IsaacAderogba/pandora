import { Doc } from "@prisma/client";
import { SelectProperty, TitleProperty } from "./properties";
import {
  DatabaseObjectResponse,
  PageObjectResponse,
  CommentObjectResponse,
  BlockObjectResponse,
  DocResponse,
  DatabaseDoc,
  PageDoc,
  BlockDoc,
  CommentDoc,
} from "./types";

export const isDatabaseObjectResponse = (
  value: DocResponse
): value is DatabaseObjectResponse => {
  if (value.object === "database") {
    if ("parent" in value) return true;
  }

  return false;
};

export const isDatabaseDoc = (value: Doc): value is DatabaseDoc =>
  value.type === "DATABASE";

export const isPageObjectResponse = (
  value: DocResponse
): value is PageObjectResponse => {
  if (value.object === "page") {
    if ("parent" in value) return true;
  }

  return false;
};

export const isPageDoc = (value: Doc): value is PageDoc =>
  value.type === "PAGE";

export const isBlockObjectResponse = (
  value: DocResponse
): value is BlockObjectResponse => {
  if (value.object === "block") {
    if ("parent" in value) return true;
  }

  return false;
};

export const isBlockDoc = (value: Doc): value is BlockDoc =>
  value.type === "BLOCK";

export const isCommentObjectResponse = (
  value: DocResponse
): value is CommentObjectResponse => {
  if (value.object === "comment") {
    if ("parent" in value) return true;
  }

  return false;
};

export const isCommentDoc = (value: Doc): value is CommentDoc =>
  value.type === "COMMENT";

export const isPageTitleProperty = (
  prop: PageObjectResponse["properties"][""]
): prop is TitleProperty => prop.type === "title";

export const isPageSelectProperty = (
  prop: PageObjectResponse["properties"][""]
): prop is SelectProperty => prop.type === "select";
