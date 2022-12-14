import { DocType } from "@prisma/client";
import { truncate } from "../../utils/text";
import { isPageTitleProperty } from "./narrowings";
import { SelectProperty, StatusProperty } from "./properties";
import {
  CommentDoc,
  DatabaseDoc,
  DatabaseObjectResponse,
  PageDoc,
  PageObjectResponse,
  CommentObjectResponse,
  BlockDoc,
  BlockObjectResponse,
  RichTextItemResponse,
} from "./types";

// database selectors
export const $databaseDoc = (
  database: DatabaseObjectResponse,
  metadata: DatabaseDoc["metadata"]
): DatabaseDoc => {
  return {
    id: database.id,
    parentId: null,
    type: DocType.DATABASE,
    title: truncate($databaseTitle(database), 255),
    data: database,
    metadata,
    createdAt: new Date(database.created_time),
    updatedAt: new Date(database.last_edited_time),
  };
};

export const $databaseTitle = (database: DatabaseObjectResponse) => {
  return $richTextsPlainText(database.title);
};

// page selectors
export const $pageDoc = (
  page: PageObjectResponse,
  metadata: PageDoc["metadata"],
  parentId = $parentId(page.parent)
): PageDoc => {
  return {
    id: page.id,
    parentId,
    type: DocType.PAGE,
    title: truncate($pageTitle(page), 255),
    data: page,
    metadata,
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

export const $pageStage = (
  page: PageObjectResponse
): SelectProperty | undefined => {
  if (page.properties["Stage"]?.type === "select") {
    return page.properties["Stage"];
  }
};

export const $pageStatus = (
  page: PageObjectResponse
): StatusProperty | undefined => {
  if (page.properties["Status"]?.type === "status") {
    return page.properties["Status"];
  }
};

export const $pageRelation = (page: PageObjectResponse, property: string) => {
  const prop = page.properties[property];
  return prop?.type === "relation" ? prop.relation : [];
};

export const $pageRichTextProp = (page: PageObjectResponse, property: string) => {
  const prop = page.properties[property];
  return prop?.type === "rich_text" ? prop.rich_text : [];
};

// comment selectors
export const $commentDoc = (
  comment: CommentObjectResponse,
  parentId = $parentId(comment.parent)
): CommentDoc => {
  return {
    id: comment.id,
    parentId,
    type: DocType.COMMENT,
    title: truncate($commentText(comment), 255),
    data: comment,
    metadata: {},
    createdAt: new Date(comment.created_time),
    updatedAt: new Date(comment.last_edited_time),
  };
};

export const $commentText = (comment: CommentObjectResponse) => {
  return $richTextsPlainText(comment.rich_text);
};

export const $commentPageMentions = (comment: CommentObjectResponse) => {
  return $mentions(comment.rich_text);
};

// block selectors
export const $blockDoc = (
  block: BlockObjectResponse,
  metadata: BlockDoc["metadata"],
  parentId = $parentId(block.parent)
): BlockDoc => {
  return {
    id: block.id,
    parentId,
    type: DocType.BLOCK,
    title: truncate($blockText(block), 255).split("\n")[0],
    data: block,
    metadata,
    createdAt: new Date(block.created_time),
    updatedAt: new Date(block.last_edited_time),
  };
};

export const $blockText = (block: BlockObjectResponse) => {
  switch (block.type) {
    case "heading_1":
    case "heading_2":
    case "heading_3":
    case "paragraph":
    case "callout":
    case "quote":
    case "bulleted_list_item":
    case "numbered_list_item":
    case "to_do":
    case "toggle":
      return $richTextsPlainText((block as any)[block.type].rich_text);
    case "child_page":
      return block.child_page.title;
    case "child_database":
      return block.child_database.title;
    case "table_row":
      return block.table_row.cells
        .map((cell) => $richTextsPlainText(cell))
        .join(" ");
    default:
      return "";
  }
};

export const $blockPageMentions = (block: BlockObjectResponse) => {
  switch (block.type) {
    case "heading_1":
    case "heading_2":
    case "heading_3":
    case "paragraph":
    case "callout":
    case "quote":
    case "bulleted_list_item":
    case "numbered_list_item":
    case "to_do":
    case "toggle":
      return $mentions((block as any)[block.type].rich_text);
    default:
      return [];
  }
};

// shared
export const $mentions = (richTexts: RichTextItemResponse[]) => {
  const mentions: string[] = [];
  for (const text of richTexts) {
    if (text.type === "mention" && text.mention.type === "page") {
      mentions.push(text.mention.page.id);
    }
  }
  return mentions;
};
export const $richTextsPlainText = (richTexts: RichTextItemResponse[]) =>
  richTexts.map(({ plain_text }) => plain_text).join("");

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
