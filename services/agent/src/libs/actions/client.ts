import axios from "axios";
import { requestWithRetry } from "../../utils/request";
import {
  ExtractionKeywordsBody,
  ExtractionKeywordsResult,
  RankingTextRankBody,
  RankingTextRankResult,
  SummarizationExtractiveBody,
  SummarizationExtractiveResult,
} from "./api";

class Actions {
  private client = axios.create({
    headers: {
      "Content-Type": "application/json",
    },
    baseURL: process.env.ACTIONS_URL,
  });

  get extraction() {
    return {
      keywords: this.extractionKeywords,
    };
  }

  private extractionKeywords = async (
    body: ExtractionKeywordsBody
  ): Promise<ExtractionKeywordsResult> => {
    return this.postRequest("/extraction/keywords", body);
  };

  get ranking() {
    return {
      textrank: this.rankingTextrank,
    };
  }

  private rankingTextrank = async (
    body: RankingTextRankBody
  ): Promise<RankingTextRankResult> => {
    return this.postRequest("/ranking/textrank", body);
  };

  get summarization() {
    return {
      extractive: this.summarizationExtractive,
    };
  }

  private summarizationExtractive = async (
    body: SummarizationExtractiveBody
  ): Promise<SummarizationExtractiveResult> => {
    return this.postRequest("/summarization/extractive", body);
  };

  private postRequest = async <T, K>(path: string, body: K): Promise<T> => {
    return requestWithRetry<T>(async () => {
      const { data } = await this.client.post<T>(path, body);
      return data;
    });
  };
}

export const actions = new Actions();
