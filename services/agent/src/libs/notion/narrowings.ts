import { DatabaseObjectResponse, NotionResponse } from "./types";

export const isDatabaseObjectResponse = (
  value: NotionResponse
): value is DatabaseObjectResponse => {
  if (value.object === "database") {
    if ("title" in value) return true;
  }

  return false;
};
