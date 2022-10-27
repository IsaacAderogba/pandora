import "reflect-metadata";
import {
  RateLimiterAbstract,
  RateLimiterRes,
  RateLimiterMemory,
} from "rate-limiter-flexible";
import { Constructor } from "../utils/types";
import { delay } from "../utils/delay";

const Key = "rate:limiter";

function rateLimiter(limiter: RateLimiterAbstract) {
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
        while (true) {
          try {
            await limiter.consume(limiter.keyPrefix, points);
            break;
          } catch (err) {
            if (!(err instanceof RateLimiterRes)) throw err;
            console.log("[before-delay] limiter.consume")
            await delay(err.msBeforeNext + 1);
            console.log("[after-delay] limiter.consume")
          }
        }

        let retries = retryAttempts;
        do {
          try {
            return await fn.apply(this, args);
          } catch (err) {
            if (retries <= 0) throw err;
            console.log("[before-delay] fn.apply")
            await delay(retryDelay);
            console.log("[after-delay] fn.apply")
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

export { RateLimiterMemory, rateLimiter, rateLimit };
