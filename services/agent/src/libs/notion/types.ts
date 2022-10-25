import {
  DatabaseObjectResponse,
  PageObjectResponse,
  PartialDatabaseObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

type DatabaseResponse = DatabaseObjectResponse | PartialDatabaseObjectResponse;
export type {
  DatabaseResponse,
  DatabaseObjectResponse,
  PartialDatabaseObjectResponse,
};

type PageResponse = PageObjectResponse | PartialPageObjectResponse;
export type { PageResponse, PageObjectResponse, PartialPageObjectResponse };

export type NotionResponse = DatabaseResponse | PageResponse;

export type {
  SearchParameters,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
