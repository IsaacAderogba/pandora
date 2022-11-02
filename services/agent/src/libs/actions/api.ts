import { Document } from "./types";

export type RankingTextRankParameters = {
  documents: Document[];
};

export type RankingTextRankResult = Document<
  { document_rank: number },
  { document_rank: number; section_rank: number },
  { document_rank: number; section_rank: number; sentence_rank: number }
>[];
