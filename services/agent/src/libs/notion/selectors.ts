import { DocType } from "@prisma/client";
import { isPageTitleProperty } from "./narrowings";
import {
  CommentDoc,
  DatabaseDoc,
  DatabaseObjectResponse,
  PageDoc,
  PageObjectResponse,
  CommentObjectResponse,
} from "./types";

// database selectors
export const $databaseDoc = (database: DatabaseObjectResponse): DatabaseDoc => {
  return {
    id: database.id,
    parentId: null,
    type: DocType.DATABASE,
    title: $databaseTitle(database),
    data: database,
    metadata: {},
    createdAt: new Date(database.created_time),
    updatedAt: new Date(database.last_edited_time),
  };
};

export const $databaseTitle = (database: DatabaseObjectResponse) => {
  return database.title.map(({ plain_text }) => plain_text).join("");
};

// page selectors
export const $pageDoc = (page: PageObjectResponse): PageDoc => {
  return {
    id: page.id,
    parentId: $parentId(page.parent),
    type: DocType.PAGE,
    title: $pageTitle(page),
    data: page,
    metadata: {},
    createdAt: new Date(page.created_time),
    updatedAt: new Date(page.last_edited_time),
  };
};

export const $pageTitle = (page: PageObjectResponse) => {
  return Object.values(page.properties)
    .filter(isPageTitleProperty)
    .map(({ title }) => title.map(({ plain_text }) => plain_text).join(""))
    .join("");
};

// comment selectors
export const $commentDoc = (
  comment: CommentObjectResponse,
  metadata: CommentDoc["metadata"]
): CommentDoc => {
  return {
    id: comment.id,
    parentId: $parentId(comment.parent),
    type: DocType.COMMENT,
    title: $commentTitle(comment),
    data: comment,
    metadata,
    createdAt: new Date(comment.created_time),
    updatedAt: new Date(comment.last_edited_time),
  };
};

export const $commentTitle = (comment: CommentObjectResponse) => {
  return comment.rich_text.map(({ plain_text }) => plain_text).join("");
};

// shared
export const $parentId = (parent: PageObjectResponse["parent"]) => {
  switch (parent.type) {
    case "database_id":
      return parent.database_id;
    case "page_id":
      return parent.page_id;
    case "block_id":
      return parent.block_id;
    default:
      return null;
  }
};
