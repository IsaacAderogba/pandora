import { Note } from "./types";

export type ExtractionKeywordsBody = {
  notes: Note[];
};

type KeywordsMetadata = { [key: string]: { term: string; rank: number } };

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
