export interface Paper {
  paperId: string;
  url: string;
  title: string;
  abstract: string;
  year: number;
  fieldsOfStudy: string[];
  publicationDate: string;
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
  journal: {
    name: string;
    pages: string;
    volume: string;
  };
  tldr: {
    model: string;
    text: string;
  };
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
