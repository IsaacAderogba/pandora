import { actions } from "./libs/actions/client";
import { $documentText } from "./libs/actions/selectors";
import { Document } from "./libs/actions/types";
import { tokenizeSentences } from "./libs/compromise/utils";
import { notion } from "./libs/notion/client";
import { PageObjectResponse } from "./libs/notion/types";
import { readwise } from "./libs/readwise/client";
import { Book, Highlight } from "./libs/readwise/types";
import { sortHighlights } from "./libs/readwise/utils";
import { withError } from "./libs/sentry";
import {
  capitallize,
  removeTrailingDot,
  startCase,
  stripMarkdown,
} from "./utils/text";

export const syncReadwise = async () => {
  // while (true) {
  await withError(async () => {
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

  const highlightSummaries = await summarizeHighlights(highlights);
  const sortedHighlights = sortHighlights(highlights);

  const page = await fetchSourcePage(book.id.toString());
  if (page) {
    await updateSourcePage(page, book, sortedHighlights, highlightSummaries);
  } else {
    await createSourcePage(book, sortedHighlights, highlightSummaries);
  }
};

const updateSourcePage = async (
  page: PageObjectResponse,
  book: Book,
  highlights: Highlight[],
  summaries: HighlightSummaries
): Promise<PageObjectResponse> => {
  const blocks = await notion.blockListAll({ block_id: page.id })
  
};

const createSourcePage = async (
  book: Book,
  highlights: Highlight[],
  summaries: HighlightSummaries
): Promise<PageObjectResponse> => {
  const title = startCase(book.author) + ", in" + startCase(book.title);
  const externalId = book.id.toString();

  return await notion.pageCreate({
    parent: { database_id: process.env.SOURCES_DATABASE_ID },
    icon: { external: { url: process.env.PANDORA_ICON_URL } },
    properties: {
      Name: {
        type: "title",
        title: [{ type: "text", text: { content: title } }],
      },
      "External Id": {
        type: "rich_text",
        rich_text: [{ type: "text", text: { content: externalId } }],
      },
      URL: { url: book.source_url },
      Status: { status: { name: "Progress" } },
      Stage: { select: { name: "0" } },
    },
    children: [
      { table_of_contents: {} },
      { divider: {} },
      ...createHighlights(highlights, summaries),
    ],
  });
};

export const createHighlights = (
  highlights: Highlight[],
  summaries: HighlightSummaries
) => {
  return highlights.flatMap(({ id, text, note }) => {
    let heading = $documentText(summaries[id]).join(" ").trim();
    heading = capitallize(stripMarkdown(removeTrailingDot(heading)));
    heading = `${heading} (${id})`;

    let paragraph = [text, note || ""].filter(Boolean).join(" ");
    paragraph = stripMarkdown(paragraph);

    return [
      { heading_3: { rich_text: [{ text: { content: heading } }] } },
      { paragraph: { rich_text: [{ text: { content: paragraph } }] } },
    ];
  });
};

const fetchSourcePage = async (
  sourceId: string
): Promise<PageObjectResponse | undefined> => {
  const { results } = await notion.pageList({
    database_id: process.env.SOURCES_DATABASE_ID,
    filter: {
      property: "External Id",
      rich_text: { equals: sourceId },
    },
  });

  return results[0];
};

const summarizeHighlights = async (
  highlights: Highlight[]
): Promise<HighlightSummaries> => {
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
            text: stripMarkdown(text),
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

type HighlightSummaries = {
  [id: string]: Document;
};
