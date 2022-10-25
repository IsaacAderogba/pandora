import {
  DatabaseObjectResponse,
  PageObjectResponse,
  PartialDatabaseObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

type DatabaseResponse = DatabaseObjectResponse | PartialDatabaseObjectResponse;
export type { DatabaseResponse, DatabaseObjectResponse };

type PageResponse = PageObjectResponse | PartialPageObjectResponse;
export type { PageResponse, PageObjectResponse };

export type NotionResponse = DatabaseResponse | PageResponse;

export type {
  SearchParameters,
  QueryDatabaseParameters,
  GetDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
