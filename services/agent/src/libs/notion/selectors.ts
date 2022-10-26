import { DocType } from "@prisma/client";
import { isPageTitleProperty } from "./narrowings";
import {
  DatabaseDoc,
  DatabaseObjectResponse,
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
export const $pageTitle = (page: PageObjectResponse) => {
  return Object.values(page.properties)
    .filter(isPageTitleProperty)
    .map(({ title }) => title.map(({ plain_text }) => plain_text).join(""));
};
