import axios from "axios";
import { rateLimit, rateLimiter } from "../limiter";
import {
  PaginationResult,
  Paper,
  PaperDetail,
  paperDetailFields,
  paperFields,
  PaperRecommendationParameters,
  PaperSearchParameters,
} from "./types";

@rateLimiter({ duration: 30000, points: 10 })
class Scholar {
  private client = axios.create({
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${process.env.READWISE_SECRET}`,
    },
    baseURL: "https://api.semanticscholar.org",
  });

  @rateLimit({ points: 1 })
  async paperSearch(
    params: PaperSearchParameters
  ): Promise<PaginationResult<Paper>> {
    const { data } = await this.client.get<PaginationResult<Paper>>(
      "/graph/v1/paper/search",
      {
        params: { ...params, fields: paperFields.join(",") },
      }
    );

    return data;
  }

  @rateLimit({ points: 1 })
  async paperDetails(id: string): Promise<PaperDetail> {
    const { data } = await this.client.get<PaperDetail>(
      `/graph/v1/paper/${id}`,
      { params: { fields: paperDetailFields.join(",") } }
    );

    return data;
  }

  @rateLimit({ points: 1 })
  async paperRecommendations(
    id: string,
    { limit = 10 }: Partial<PaperRecommendationParameters> = {}
  ): Promise<Paper[]> {
    const { data } = await this.client.get<{ recommendPapers: Paper[] }>(
      `/recommendations/v1/papers/forpaper/${id}`,
      { params: { limit, fields: paperFields.join(",") } }
    );

    return data.recommendPapers;
  }
}

export const scholar = new Scholar();
