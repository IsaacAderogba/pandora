import { RateLimiterAbstract, RateLimiterMemory } from "rate-limiter-flexible";
import { Client } from "@notionhq/client";

export interface NotionProps {
  requestsPerSecond: number;
}

export class Notion {
  limiter: RateLimiterAbstract;
  client: Client;

  constructor({ requestsPerSecond }: NotionProps) {
    this.limiter = new RateLimiterMemory({
      points: requestsPerSecond,
      duration: 1,
    });

    this.client = new Client({
      auth: process.env.NOTION_SECRET,
      notionVersion: "2022-06-28",
    });
  }
}
