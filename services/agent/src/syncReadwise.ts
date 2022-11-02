import { actions } from "./libs/actions/client";
import { Document } from "./libs/actions/types";
import { tokenizeSentences } from "./libs/compromise/utils";
import { readwise } from "./libs/readwise/client";
import { ExportedBook } from "./libs/readwise/types";
import { sortHighlights } from "./libs/readwise/utils";
import { withError } from "./libs/sentry";

export const syncReadwise = async () => {
  // while (true) {
  await withError(async () => {
    // const lastSyncedAt = new Date();
    await syncAccount();
  });
  // }
};

const syncAccount = async () => {
  const books = await readwise.exportListAll();

  for (const book of books) {
    await withError(async () => await syncBook(book));
  }
};

const syncBook = async (book: ExportedBook) => {
  const highlights = sortHighlights(book.highlights);

  const document: Document = {
    id: book.user_book_id,
    metadata: null,
    sections: highlights.map(({ id, text, note }) => {
      return {
        id: id,
        metadata: null,
        sentences: [
          ...tokenizeSentences(text),
          ...tokenizeSentences(note || ""),
        ],
      };
    }),
  };

  console.log(document.sections);

  // const subPageSummaries = await actions.summarization.extractive({
  //   options: { num_sentences: 1 },
  //   documents: [document],
  // });

  // console.log(book.title, subPageSummaries);
};
