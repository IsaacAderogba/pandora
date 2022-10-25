import { Client } from "@notionhq/client";
import { RateLimiterMemory, rateLimiter, rateLimit } from "./rateLimiter";

const limiter = new RateLimiterMemory({
  points: 1,
  duration: 1,
  keyPrefix: "notion-rate-limiter",
});

// @rateLimiter(limiter)
class Notion {
  client = new Client({
    auth: process.env.NOTION_SECRET,
    notionVersion: "2022-06-28",
  });

  // @rateLimit(1)
  test() {
    console.log("exec");
  }
}

export const notion = new Notion();
