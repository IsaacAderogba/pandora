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
      const points = Reflect.getMetadata(Key, target.prototype, key);
      const isMethod = desc?.value instanceof Function;

      if (!isMethod || !points) continue;

      const originalMethod = desc.value;

      desc.value = async function (...args: unknown[]) {
        while (true) {
          try {
            await limiter.consume(limiter.keyPrefix, points);
            break;
          } catch (err) {
            if (!(err instanceof RateLimiterRes)) throw err;
            await delay(err.msBeforeNext + 1);
          }
        }

        return originalMethod.apply(this, args);
      };

      Object.defineProperty(target.prototype, key, desc);
    }
  };
}

function rateLimit(points: number) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    Reflect.defineMetadata(Key, points, target, key);
  };
}

export { RateLimiterMemory, rateLimiter, rateLimit };
