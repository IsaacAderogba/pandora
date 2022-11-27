import { Note } from "./types";

export type ExtractionKeywordsBody = {
  notes: Note[];
};

type KeywordsMetadata = {
  keywords: { [key: string]: { term: string; rank: number } };
};

export type ExtractionKeywordsResult = Note<
  KeywordsMetadata,
  KeywordsMetadata,
  KeywordsMetadata
>[];

export type RankingTextRankBody = {
  notes: Note[];
};

export type RankingTextRankResult = Note<
  { note_rank: number },
  { note_rank: number; section_rank: number },
  { note_rank: number; section_rank: number; sentence_rank: number }
>[];

export type SummarizationExtractiveBody = {
  notes: Note[];
  options: {
    num_sentences: number;
  };
};

export type SummarizationExtractiveResult = Note[];

export type SimilarityCosineBody = {
  notes: Note[];
  text: string;
};

export type SimilarityCosineResult = Note<
  { similarity_cosine: number },
  { similarity_cosine: number },
  { similarity_cosine: number }
>[];

export type CacheSetBody<T> = {
  key: string;
  value: T;
};

export type CacheSetResult<T> = T;
export type CacheGetResult<T> = T | null;

export type EmbeddingsStoreBody = {
  notes: Note[];
};
export type EmbeddingsStoreResult = boolean;

export type EmbeddingsSearchBody = {
  notes: Note[];
  options: {
    limit: number;
  };
};

export type EmbeddingsSearchResult = Note<{
  embeddings_search: [string, number][];
}>[];
