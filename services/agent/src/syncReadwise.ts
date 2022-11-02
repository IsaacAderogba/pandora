import util from "util";
import { actions } from "./libs/actions/client";
import { Document } from "./libs/actions/types";
import { tokenizeSentences } from "./libs/compromise/utils";
import { readwise } from "./libs/readwise/client";
import { Book, Highlight } from "./libs/readwise/types";
import { sortHighlights } from "./libs/readwise/utils";
import { withError } from "./libs/sentry";
import { capitallize, stripMarkdown } from "./utils/text";

export const syncReadwise = async () => {
  // while (true) {
  await withError(async () => {
    // const lastSyncedAt = new Date();
    await syncAccount();
  });
  // }
};

const syncAccount = async () => {
  const books = await readwise.bookListAll();

  // for (const book of books) {
  await withError(async () => await syncBook(books[0]));
  // }
};

const syncBook = async (book: Book) => {
  const highlights = await readwise.highlightListAll({ book_id: book.id });
  const summarizedHighlights = await summarizeHighlights(highlights);

  /**
   * 
   */
};

const summarizeHighlights = async (highlights: Highlight[]) => {
  const documents: Document[] = highlights.map(({ id, text, note }) => {
    return {
      id,
      metadata: null,
      sections: [
        {
          id: null,
          metadata: null,
          sentences: [
            ...tokenizeSentences(text),
            ...tokenizeSentences(note || ""),
          ].map((text) => ({
            metadata: null,
            text: capitallize(stripMarkdown(text)),
          })),
        },
      ],
    };
  });

  const results = await actions.summarization.extractive({
    options: { num_sentences: 1 },
    documents,
  });

  const summarizedDocuments: { [id: string]: Document } = {};
  for (const result of results) {
    summarizedDocuments[result.id!] = result;
  }

  return summarizedDocuments;
};
