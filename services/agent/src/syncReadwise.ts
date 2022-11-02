import { readwise } from "./libs/readwise/client";
import { withError } from "./libs/sentry";

export const syncReadwise = async () => {
  // while (true) {
    await withError(async () => {
      const lastSyncedAt = new Date();
      await syncLatest();
    });
  // }
};

const syncLatest = async () => {
  const books = await readwise.exportListAll();
  console.log("response", books.length)
};

/**
 * Need to sort by location from lowest to high
 */