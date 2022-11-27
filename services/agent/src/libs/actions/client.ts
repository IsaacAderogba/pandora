import axios from "axios";
import { requestWithRetry } from "../../utils/request";
import {
  CacheGetResult,
  CacheSetResult,
  EmbeddingsSearchBody,
  EmbeddingsSearchResult,
  EmbeddingsStoreBody,
  EmbeddingsStoreResult,
  ExtractionKeywordsBody,
  ExtractionKeywordsResult,
  RankingTextRankBody,
  RankingTextRankResult,
  SimilarityCosineBody,
  SimilarityCosineResult,
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
    return this.postWithRetry("/extraction/keywords", body);
  };

  get ranking() {
    return {
      textrank: this.rankingTextrank,
    };
  }

  private rankingTextrank = async (
    body: RankingTextRankBody
  ): Promise<RankingTextRankResult> => {
    return this.postWithRetry("/ranking/textrank", body);
  };

  get summarization() {
    return {
      extractive: this.summarizationExtractive,
    };
  }

  private summarizationExtractive = async (
    body: SummarizationExtractiveBody
  ): Promise<SummarizationExtractiveResult> => {
    return this.postWithRetry("/summarization/extractive", body);
  };

  get similarity() {
    return {
      cosine: this.similarityCosine,
    };
  }

  private similarityCosine = async (
    body: SimilarityCosineBody
  ): Promise<SimilarityCosineResult> => {
    return this.postWithRetry("/similarity/cosine", body);
  };

  get cache() {
    return {
      set: this.cacheSet,
      get: this.cacheGet,
    };
  }

  private cacheSet = async <T>(
    key: string,
    value: T
  ): Promise<CacheSetResult<T>> => {
    return this.postWithRetry(`/cache/set/${key}`, { value });
  };

  private cacheGet = async <T>(key: string): Promise<CacheGetResult<T>> => {
    return this.getWithRetry(`/cache/get/${key}`, {});
  };

  get embeddings() {
    return {
      store: this.embeddingsStore,
      search: this.embeddingsSearch,
    };
  }

  private embeddingsStore = async (
    body: EmbeddingsStoreBody
  ): Promise<EmbeddingsStoreResult> => {
    return this.postWithRetry("/embeddings/store", body);
  };

  private embeddingsSearch = async (
    body: EmbeddingsSearchBody
  ): Promise<EmbeddingsSearchResult> => {
    return this.postWithRetry("/embeddings/search", body);
  };

  private getWithRetry = async <T, K>(path: string, params: K): Promise<T> => {
    return requestWithRetry<T>(async () => {
      const { data } = await this.client.get<T>(path, { params });
      return data;
    });
  };

  private postWithRetry = async <T, K>(path: string, body: K): Promise<T> => {
    return requestWithRetry<T>(async () => {
      const { data } = await this.client.post<T>(path, body);
      return data;
    });
  };
}

export const actions = new Actions();
