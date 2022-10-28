import "reflect-metadata";
import { RateLimiter } from "limiter";
import { Constructor } from "../utils/types";
import { delay } from "../utils/delay";
import { debug } from "../utils/debug";

const Key = "rate:limiter";

interface RateLimiterProps {
  points: number;
  duration: number;
}

function rateLimiter({ points, duration }: RateLimiterProps) {
  const limiter = new RateLimiter({
    interval: duration,
    tokensPerInterval: points,
  });

  return function target<T extends Constructor>(target: T) {
    for (const key of Object.getOwnPropertyNames(target.prototype)) {
      const desc = Object.getOwnPropertyDescriptor(target.prototype, key);
      const metadata: RateLimit = Reflect.getMetadata(
        Key,
        target.prototype,
        key
      );
      const isMethod = desc?.value instanceof Function;

      if (!isMethod || !metadata) continue;
      const { points, retryAttempts, retryDelay } = metadata;

      const fn = desc.value;
      desc.value = async function (...args: unknown[]) {
        let retries = retryAttempts;
        do {
          try {
            debug("[before-tokens]");
            await limiter.removeTokens(points);
            debug("[after-tokens]");
            return await fn.apply(this, args);
          } catch (err) {
            if (retries <= 0) throw err;
            debug("[before-delay]", retries);
            await delay(retryDelay);
            debug("[after-delay]", retries);
          }
        } while (retries-- > 0);
      };

      Object.defineProperty(target.prototype, key, desc);
    }
  };
}

interface RateLimit {
  points: number;
  retryAttempts: number;
  retryDelay: number;
}

function rateLimit(props: Partial<RateLimit> = {}) {
  const metadata: RateLimit = {
    points: 1,
    retryAttempts: 3,
    retryDelay: 1000,
    ...props,
  };

  return function (target: any, key: string, desc: PropertyDescriptor) {
    Reflect.defineMetadata(Key, metadata, target, key);
  };
}

export { rateLimiter, rateLimit };
