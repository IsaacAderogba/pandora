import axios from "axios";
import { RankingTextRankBody, RankingTextRankResult } from "./api";

class Actions {
  client = axios.create({
    headers: {
      "Content-Type": "application/json",
    },
    baseURL: process.env.ACTIONS_URL,
  });

  get ranking() {
    return {};
  }

  rankingTextrank = async (
    body: RankingTextRankBody
  ): Promise<RankingTextRankResult> => {
    const { data } = await this.client.post<RankingTextRankResult>(
      `/ranking/textrank`,
      { body }
    );

    return data;
  };

  get summarization() {
    return {};
  }
}

export const actions = new Actions();
