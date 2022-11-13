import { Nullable } from "../../utils/types";

export interface Paper {
  paperId: string;
  url: string;
  title: string;
  abstract: Nullable<string>;
  year: number;
  fieldsOfStudy: Nullable<string[]>;
  publicationDate: Nullable<string>;
  authors: { authorId: string; name: string }[];
}

export const paperFields = [
  "paperId",
  "url",
  "title",
  "abstract",
  "year",
  "fieldsOfStudy",
  "publicationDate",
  "authors",
] as const;

export interface PaperSearchParameters {
  query: string;
  offset?: number;
  limit?: number;
}

export interface PaperDetail extends Paper {
  venue: string;
  referenceCount: number;
  citationCount: number;
  influentialCitationCount: number;
  publicationTypes: string[];
  journal: Nullable<{
    name: string;
    pages: string;
    volume: string;
  }>;
  tldr: Nullable<{
    model: string;
    text: string;
  }>;
}

export const paperDetailFields = [
  ...paperFields,
  "venue",
  "referenceCount",
  "citationCount",
  "influentialCitationCount",
  "publicationTypes",
  "journal",
  "tldr",
];

export interface PaperRecommendationParameters {
  limit?: number;
}

export type PaginationResult<T> = {
  total: number;
  offset: number;
  next: number;
  data: T[];
};
