import { readwise } from "./libs/readwise/client";
import { ExportedBook } from "./libs/readwise/types";
import { sortHighlights } from "./libs/readwise/utils";
import { withError } from "./libs/sentry";

export const syncReadwise = async () => {
  // while (true) {
  await withError(async () => {
    // const lastSyncedAt = new Date();
    console.log("start");
    await syncAccount();
  });
  // }
};

const syncAccount = async () => {
  const books = await readwise.exportListAll();
  console.log("result");

  for (const book of books) {
    await withError(async () => await syncBook(book));
  }
};

const syncBook = async (book: ExportedBook) => {
  const highlights = sortHighlights(book.highlights);
  console.log(highlights);
};
