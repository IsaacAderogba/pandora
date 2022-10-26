import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export type CheckboxProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "checkbox" }
>;

export type CreatedByProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "created_by" }
>;

export type CreatedTimeProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "created_time" }
>;

export type DateProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "date" }
>;

export type EmailProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "email" }
>;

export type URLProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "url" }
>;

export type NumberProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "number" }
>;

export type PhoneNumberProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "phone_number" }
>;

export type SelectProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "select" }
>;

export type StatusProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "status" }
>;

export type MultiSelectProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "multi_select" }
>;

export type PeopleProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "people" }
>;

export type LastEditedByProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "last_edited_by" }
>;

export type LastEditedTimeProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "last_edited_time" }
>;

export type TitleProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "title" }
>;

export type RichTextProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "rich_text" }
>;

export type FilesProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "files" }
>;

export type FormulaProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "formula" }
>;

export type RollupProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "rollup" }
>;

export type RelationProperty = Extract<
  PageObjectResponse["properties"][""],
  { type: "relation" }
>;
