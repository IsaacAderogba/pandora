import { Nullable } from "../../utils/types";

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
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

export interface Tag {
  id: number;
  name: string;
}
