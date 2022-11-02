import { delay } from "./delay";

export const requestWithRetry = async <T>(
  callback: () => Promise<T>,
  retryDelay = 1000
) => {
  let retries = 3;
  let err: unknown;

  do {
    try {
      return await callback();
    } catch (caughtErr) {
      err = caughtErr;
      await delay(retryDelay);
    }
  } while (retries-- > 0);

  throw err;
};
