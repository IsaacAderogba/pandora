import {
  DatabaseObjectResponse,
  PageObjectResponse,
  NotionResponse,
} from "./types";

export const isDatabaseObjectResponse = (
  value: NotionResponse
): value is DatabaseObjectResponse => {
  if (value.object === "database") {
    if ("title" in value) return true;
  }

  return false;
};

export const isPageObjectResponse = (
  value: NotionResponse
): value is PageObjectResponse => {
  if (value.object === "page") {
    if ("title" in value) return true;
  }

  return false;
};
