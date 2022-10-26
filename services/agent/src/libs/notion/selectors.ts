import { DatabaseObjectResponse, PageObjectResponse } from "./types";

// database selectors
export const $databaseTitle = (database: DatabaseObjectResponse) => {
  return database.title.map(({ plain_text }) => plain_text).join("");
};

// page selectors
export const $pageTitle = (page: PageObjectResponse) => {
  return Object.values(page.properties)
    .filter((prop) => prop.type === "title")
    .map((title) => {});
};
