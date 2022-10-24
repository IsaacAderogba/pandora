import { Client } from "@notionhq/client";
import { RateLimiterMemory, rateLimiter } from "./rateLimiter";

const limiter = new RateLimiterMemory({
  points: 2,
  duration: 1,
  keyPrefix: "notion-rate-limiter",
});

@rateLimiter(limiter)
export class Notion {
  client = new Client({
    auth: process.env.NOTION_SECRET,
    notionVersion: "2022-06-28",
  });
}
