import { RateLimiterMemory } from "rate-limiter-flexible";

export const notionLimiter = new RateLimiterMemory({
  points: 1,
  duration: 1,
  keyPrefix: "notion-rate-limiter",
});
