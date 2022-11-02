import { Nullable } from "../../utils/types";

export interface Book {
  id: number;
  title: string;
  author: string;
  category: BookCategory;
  source: string;
  num_highlights: number;
  last_highlight_at: string;
  updated: string;
  cover_image_url: string;
  highlights_url: string;
  source_url: Nullable<string>;
  asin: string;
  tags: Tag[];
}

export interface ExportedBook {
  user_book_id: number;
  title: string;
  author: string;
  readable_title: string;
  source: string;
  cover_image_url: string;
  unique_url: string;
  book_tags: Tag[];
  category: BookCategory;
  readwise_url: string;
  source_url: string;
  asin: string;
  highlights: Highlight[];
}

export interface BookListParameters {
  page_size: number;
  page: number;
  url: string;
  source: string;
  num_highlights: number;
  num_highlights__lt: number;
  num_highlights__gt: number;
  updated__lt: string;
  updated__gt: string;
  last_highlight_at__lt: string;
  last_highlight_at__gt: string;
}

export type BookCategory =
  | "books"
  | "articles"
  | "tweets"
  | "supplementals"
  | "podcasts";

export interface Highlight {
  id: number;
  text: string;
  location: number;
  location_type: string;
  note: Nullable<string>;
  color: string;
  highlighted_at: string;
  created_at: string;
  updated_at: string;
  external_id: string;
  end_location: Nullable<string>;
  url: Nullable<string>;
  book_id: number;
  tags: Tag[];
  is_favorite: boolean;
  is_discard: boolean;
  readwise_url: string;
}

export interface HighlightListParameters {
  page_size: number;
  page: number;
  url: string;
  book_id: number;
  updated__lt: string;
  updated__gt: string;
  highlight_at__lt: string;
  highlight_at__gt: string;
}

export interface ExportParameters {
  updatedAfter: string;
  ids: string[];
  pageCursor: string;
}

export type ExportResult = {
  count: number;
  nextPageCursor: Nullable<string>;
  results: ExportedBook[];
};
export interface Tag {
  id: number;
  name: string;
}

export type PaginationResult<T> = {
  count: number;
  next: Nullable<string>;
  previous: Nullable<string>;
  results: T[];
};
