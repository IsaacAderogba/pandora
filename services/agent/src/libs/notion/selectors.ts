import { DocType } from "@prisma/client";
import { isPageTitleProperty } from "./narrowings";
import {
  DatabaseDoc,
  DatabaseObjectResponse,
  PageDoc,
  PageObjectResponse,
} from "./types";

// database selectors
export const $databaseDoc = (database: DatabaseObjectResponse): DatabaseDoc => {
  return {
    id: database.id,
    parentId: null,
    type: DocType.DATABASE,
    title: $databaseTitle(database),
    data: database,
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
