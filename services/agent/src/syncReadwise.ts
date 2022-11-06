import { actions } from "./libs/actions/client";
import { $documentText } from "./libs/actions/selectors";
import { Note } from "./libs/actions/types";
import { tokenizeSentences } from "./libs/compromise/utils";
import { chunk } from "./libs/lodash/array";
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
import { debug } from "./utils/debug";
import {
  capitallize,
  extractMarkdownUrls,
  removeTrailingDot,
  startCase,
  stripMarkdown,
} from "./utils/text";

export const syncReadwise = async () => {
  while (true) {
    await withError(async () => {
      await syncAccount();
    });
  }
};

const syncAccount = async () => {
  const books = await readwise.bookListAll();

  for (const book of books) {
    await withError(async () => await syncBook(book));
  }
};

const syncBook = async (book: Book) => {
  const highlights = await readwise.highlightListAll({ book_id: book.id });
  const halfHourAgo = getHalfHourAgo();
  const filteredHighlights = highlights.filter(
    (h) => halfHourAgo > new Date(h.updated)
  );

  const highlightsHaveSettled = filteredHighlights.length === highlights.length;
  if (highlightsHaveSettled) {
    const highlightSummaries = await summarizeHighlights(filteredHighlights);
    const sortedHighlights = sortHighlights(filteredHighlights);

    const page = await notion.pageFindExternal(
      process.env.SOURCES_DATABASE_ID,
      book.id.toString()
    );

    if (page) {
      await updateSourcePage(page, sortedHighlights, highlightSummaries);
    } else {
      await createSourcePage(book, sortedHighlights, highlightSummaries);
    }

    debug(`book upserted, ${book.title}`);
  }
};

const createSourcePage = async (
  book: Book,
  highlights: Highlight[],
  summaries: HighlightSummaries
): Promise<void> => {
  const title = startCase(book.author) + ", in " + startCase(book.title);
  const externalId = book.id.toString();

  let page: PageObjectResponse | undefined;
  for (const chunkedHighlights of chunk(highlights, 25)) {
    if (page) {
      await notion.blockAppend({
        block_id: page.id,
        children: createHighlights(chunkedHighlights, summaries),
      });
    } else {
      page = await notion.pageCreate({
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
          ...createHighlights(chunkedHighlights, summaries),
        ],
      });
    }
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
    if (block.type !== "heading_3") continue;

    const heading_3 = block.heading_3.rich_text[0];
    if (heading_3.type === "text" && heading_3.text.link?.url) {
      const id = new URL(heading_3.text.link.url).searchParams.get("id");
      if (id) idToBlock.set(id, block);
    }
  }

  // append new highlights
  const highlightsToCreate = highlights.filter(
    ({ id }) => idToBlock.has(id.toString()) === false
  );

  for (const chunkedHighlights of chunk(highlightsToCreate, 25)) {
    await notion.blockAppend({
      block_id: page.id,
      children: createHighlights(chunkedHighlights, summaries),
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

export const createHighlights = (
  highlights: Highlight[],
  summaries: HighlightSummaries
): Exclude<CreatePageParameters["children"], undefined> => {
  return highlights.flatMap(({ id, text, note }) => {
    let summary = $documentText(summaries[id]).join(" ").trim();
    summary = capitallize(stripMarkdown(removeTrailingDot(summary)));
    const heading = note ? removeTrailingDot(note?.trim()) : summary;

    let paragraph = [text, note || ""].filter(Boolean).join(" ").trim();
    paragraph = stripMarkdown(paragraph);
    const urls = extractMarkdownUrls(text);

    return [
      {
        heading_3: {
          is_toggleable: true,
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
            ...urls.map((url) => ({ embed: { url } })),
          ],
        },
      },
    ];
  });
};

const summarizeHighlights = async (
  highlights: Highlight[]
): Promise<HighlightSummaries> => {
  const notes: Note[] = highlights.map(({ id, text, note }) => {
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
            id: null,
            metadata: null,
            text: stripMarkdown(text),
          })),
        },
      ],
    };
  });

  const results = await actions.summarization.extractive({
    options: { num_sentences: 1 },
    notes,
  });

  const summarizedNotes: { [id: string]: Note } = {};
  for (const result of results) {
    summarizedNotes[result.id!] = result;
  }

  return summarizedNotes;
};

type HighlightSummaries = {
  [id: string]: Note;
};

const getHalfHourAgo = () => new Date(Date.now() - 1000 * 60 * 30);
