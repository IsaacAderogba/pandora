import { Document } from "./types";

export type ExtractionKeywordsBody = {
  documents: Document[];
};

type KeywordsMetadata = { [key: string]: { term: string; rank: number } };

export type ExtractionKeywordsResult = Document<
  KeywordsMetadata,
  KeywordsMetadata,
  KeywordsMetadata
>[];

export type RankingTextRankBody = {
  documents: Document[];
};

export type RankingTextRankResult = Document<
  { document_rank: number },
  { document_rank: number; section_rank: number },
  { document_rank: number; section_rank: number; sentence_rank: number }
>[];

export type SummarizationExtractiveBody = {
  documents: Document[];
  options: {
    num_sentences: number;
  };
};

export type SummarizationExtractiveResult = Document[];
