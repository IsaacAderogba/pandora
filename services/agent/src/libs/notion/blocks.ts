import { BlockObjectResponse } from "./types";

export type AudioBlockResponse = Extract<
  BlockObjectResponse,
  { type: "audio" }
>;
export type BookmarkBlockResponse = Extract<
  BlockObjectResponse,
  { type: "bookmark" }
>;
export type BreadcrumbBlockResponse = Extract<
  BlockObjectResponse,
  { type: "breadcrumb" }
>;
export type BulletedListItemBlockResponse = Extract<
  BlockObjectResponse,
  { type: "bulleted_list_item" }
>;
export type CalloutBlockResponse = Extract<
  BlockObjectResponse,
  { type: "callout" }
>;
export type ChildDatabaseBlockResponse = Extract<
  BlockObjectResponse,
  { type: "child_database" }
>;
export type ChildPageBlockResponse = Extract<
  BlockObjectResponse,
  { type: "child_page" }
>;
export type CodeBlockResponse = Extract<BlockObjectResponse, { type: "code" }>;
export type ColumnBlockResponse = Extract<
  BlockObjectResponse,
  { type: "column" }
>;
export type ColumnListBlockResponse = Extract<
  BlockObjectResponse,
  { type: "column_list" }
>;
export type DividerBlockResponse = Extract<
  BlockObjectResponse,
  { type: "divider" }
>;
export type EmbedBlockResponse = Extract<
  BlockObjectResponse,
  { type: "embed" }
>;
export type EquationBlockResponse = Extract<
  BlockObjectResponse,
  { type: "equation" }
>;
export type FileBlockResponse = Extract<BlockObjectResponse, { type: "file" }>;
export type HeadingOneBlockResponse = Extract<
  BlockObjectResponse,
  { type: "heading_1" }
>;
export type HeadingTwoBlockResponse = Extract<
  BlockObjectResponse,
  { type: "heading_2" }
>;
export type HeadingThreeBlockResponse = Extract<
  BlockObjectResponse,
  { type: "heading_3" }
>;
export type ImageBlockResponse = Extract<
  BlockObjectResponse,
  { type: "image" }
>;
export type LinkPreviewBlockResponse = Extract<
  BlockObjectResponse,
  { type: "link_preview" }
>;
export type LinkToPageBlockResponse = Extract<
  BlockObjectResponse,
  { type: "link_to_page" }
>;
export type NumberedListItemBlockResponse = Extract<
  BlockObjectResponse,
  { type: "numbered_list_item" }
>;
export type ParagraphBlockResponse = Extract<
  BlockObjectResponse,
  { type: "paragraph" }
>;
export type PDFBlockResponse = Extract<BlockObjectResponse, { type: "pdf" }>;
export type QuoteBlockResponse = Extract<
  BlockObjectResponse,
  { type: "quote" }
>;
export type SyncedBlockResponse = Extract<
  BlockObjectResponse,
  { type: "synced_block" }
>;
export type TableBlockResponse = Extract<
  BlockObjectResponse,
  { type: "table" }
>;
export type TableRowBlockResponse = Extract<
  BlockObjectResponse,
  { type: "table_row" }
>;
export type TableOfContentsBlockResponse = Extract<
  BlockObjectResponse,
  { type: "table_of_contents" }
>;
export type TemplateBlockResponse = Extract<
  BlockObjectResponse,
  { type: "template" }
>;
export type TodoBlockResponse = Extract<BlockObjectResponse, { type: "to_do" }>;
export type ToggleBlockResponse = Extract<
  BlockObjectResponse,
  { type: "toggle" }
>;
export type UnsupportedBlockResponse = Extract<
  BlockObjectResponse,
  { type: "unsupported" }
>;
export type VideoBlockResponse = Extract<
  BlockObjectResponse,
  { type: "video" }
>;
