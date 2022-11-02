import { Document } from "./types";

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
