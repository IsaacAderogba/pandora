import { DocType } from "@prisma/client";
import { truncate } from "../../utils/text";
import { isPageTitleProperty } from "./narrowings";
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
export const $databaseDoc = (database: DatabaseObjectResponse): DatabaseDoc => {
  return {
    id: database.id,
    parentId: null,
    type: DocType.DATABASE,
    title: truncate($databaseTitle(database), 255),
    data: database,
    metadata: {},
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
  metadata: PageDoc["metadata"]
): PageDoc => {
  return {
    id: page.id,
    parentId: $parentId(page.parent),
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

// comment selectors
export const $commentDoc = (comment: CommentObjectResponse): CommentDoc => {
  return {
    id: comment.id,
    parentId: $parentId(comment.parent),
    type: DocType.COMMENT,
    title: truncate($commentTitle(comment), 255),
    data: comment,
    metadata: {},
    createdAt: new Date(comment.created_time),
    updatedAt: new Date(comment.last_edited_time),
  };
};

export const $commentTitle = (comment: CommentObjectResponse) => {
  return $richTextsPlainText(comment.rich_text);
};

// block selectors
export const $blockDoc = (
  block: BlockObjectResponse,
  metadata: BlockDoc["metadata"]
): BlockDoc => {
  return {
    id: block.id,
    parentId: $parentId(block.parent),
    type: DocType.BLOCK,
    title: truncate($blockText(block), 255),
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
    default:
      return "";
  }
};

// shared
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
