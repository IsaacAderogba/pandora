import { actions } from "./libs/actions/client";
import { $documentText } from "./libs/actions/selectors";
import { Document } from "./libs/actions/types";
import { tokenizeSentences } from "./libs/compromise/utils";
import { notion } from "./libs/notion/client";
import {
  BlockObjectResponse,
  CreatePageParameters,
  PageObjectResponse,
} from "./libs/notion/types";
import { readwise } from "./libs/readwise/client";
import { Book, Highlight } from "./libs/readwise/types";
import { sortHighlights } from "./libs/readwise/utils";
import { withError } from "./libs/sentry";
import {
  capitallize,
  extractMarkdownUrls,
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
    await updateSourcePage(page, sortedHighlights, highlightSummaries);
  } else {
    await createSourcePage(book, sortedHighlights, highlightSummaries);
  }
};

const updateSourcePage = async (
  page: PageObjectResponse,
  highlights: Highlight[],
  summaries: HighlightSummaries
): Promise<void> => {
  const blocks = await notion.blockListAll({ block_id: page.id });
  const idToBlock = new Map<string, BlockObjectResponse>();

  for (const block of blocks) {
    if (block.type !== "callout") continue;

    const callout = block.callout.rich_text[0];
    if (callout.type === "text" && callout.text.link?.url) {
      const id = new URL(callout.text.link.url).searchParams.get("id");
      if (id) idToBlock.set(id, block);
    }
  }

  // append new highlights
  const highlightsToCreate = highlights.filter(
    ({ id }) => idToBlock.has(id.toString()) === false
  );

  if (highlightsToCreate.length) {
    await notion.blockAppend({
      block_id: page.id,
      children: createHighlights(highlightsToCreate, summaries),
    });
  }

  // delete missing highlights
  for (const { id } of highlights) {
    idToBlock.delete(id.toString());
  }

  for (const [_, block] of idToBlock) {
    await notion.blockDelete({ block_id: block.id });
  }
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
    children: createHighlights(highlights, summaries),
  });
};

export const createHighlights = (
  highlights: Highlight[],
  summaries: HighlightSummaries
): Exclude<CreatePageParameters["children"], undefined> => {
  console.log(highlights);
  return highlights.flatMap(({ id, text, note }) => {
    let heading = $documentText(summaries[id]).join(" ").trim();
    heading = capitallize(stripMarkdown(removeTrailingDot(heading)));

    let paragraph = [text, note || ""].filter(Boolean).join(" ");
    paragraph = stripMarkdown(paragraph);
    const urls = extractMarkdownUrls(text);

    return [
      {
        callout: {
          icon: { type: "emoji", emoji: "📝" },
          color: "default",
          rich_text: [
            {
              text: {
                content: heading,
                link: { url: `https://readwise.io?id=${id}` },
              },
            },
          ],
          children: [
            { paragraph: { rich_text: [{ text: { content: paragraph } }] } },
            ...urls.map((url) => ({ image: { external: { url } } })),
          ],
        },
      },
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
