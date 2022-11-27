import { chunk } from "lodash";
import { actions } from "../../../libs/actions/client";
import { Note } from "../../../libs/actions/types";
import {
  createNote,
  createSection,
  createSentence,
} from "../../../libs/actions/utils";
import { RichTextRequest } from "../../../libs/notion/blocks";
import { notion } from "../../../libs/notion/client";
import {
  isBlockDoc,
  isDatabaseDoc,
  isPageDoc,
} from "../../../libs/notion/narrowings";
import {
  $blockText,
  $mentions,
  $pageRichTextProp,
  $pageStatus,
  $pageTitle,
} from "../../../libs/notion/selectors";
import { BlockDoc, PageDoc } from "../../../libs/notion/types";
import { prisma } from "../../../libs/prisma";
import { upsertPage } from "../page";
import { PageStrategy } from "./Strategy";

export class RelatePagesStrategy implements PageStrategy {
  key = "Related";

  run: PageStrategy["run"] = async (_, page) => {
    const note = this.prepareNote(page, await this.loadText(page));
    await this.storeEmbeddings(note);
    if (this.shouldSkipStrategy(page)) return page;

    const pages = await this.searchEmbeddings(page, note);
    if (this.relationsHaventChanged(page, pages)) return page;

    const request = await this.prepareRequest(pages);
    return this.upsertPage(page, request);
  };

  upsertPage = async (page: PageDoc, request: RichTextRequest[]) => {
    const data = await notion.pageUpdate({
      page_id: page.id,
      properties: {
        [this.key]: { rich_text: request },
      },
    });

    return await upsertPage(data, page.metadata, page.parentId!);
  };

  prepareRequest = async (pages: PageDoc[]) => {
    const remoteIds: string[] = [];

    for (const doc of pages) {
      try {
        const page = await notion.pageRetrieve({ page_id: doc.id });
        if (page) remoteIds.push(page.id);
      } catch {
        // no op if page can't be retrieved (likely means archived)
      }
    }

    const richTexts: RichTextRequest[] = remoteIds.flatMap((id, i, arr) => {
      if (i === arr.length - 1) return [{ mention: { page: { id } } }];
      return [{ mention: { page: { id } } }, { text: { content: " · " } }];
    });

    return richTexts;
  };

  relationsHaventChanged = (page: PageDoc, pages: PageDoc[]) => {
    const prevRelated = $pageRichTextProp(page.data, this.key);

    const extractedIds = new Set(pages.map((page) => page.id));
    const existingIds = new Set($mentions(prevRelated));

    for (const id of extractedIds) {
      if (!existingIds.has(id)) return false;
    }

    return true;
  };

  searchEmbeddings = async ({ id }: PageDoc, note: Note) => {
    const [result] = await actions.embeddings.search({
      notes: [note],
      options: { limit: 25 },
    });

    const blacklist = new Set<string>([id]);
    const ids = result.metadata.embeddings_search
      .filter(([id, score]) => !blacklist.has(id) && score > 0.8)
      .map(([id]) => id);
    const docs = await prisma.doc.findMany({ where: { id: { in: ids } } });

    const parentIds = docs
      .map((doc) => doc.parentId)
      .filter(Boolean) as string[];
    const parentDocs = await prisma.doc.findMany({
      where: { id: { in: parentIds } },
    });

    const parentToPageIds = new Map(
      parentDocs.filter(isDatabaseDoc).map((db) => [db.id, db.metadata.pageIds])
    );

    const pageDocs = docs.filter(isPageDoc).filter(({ id, parentId }) => {
      if (!parentId) return false;
      const pageIds = parentToPageIds.get(parentId) || [];
      return pageIds.includes(id);
    });

    const embeddingsMap = new Map(result.metadata.embeddings_search);
    return pageDocs
      .sort((a, b) => {
        const aScore = embeddingsMap.get(a.id) || 0;
        const bScore = embeddingsMap.get(b.id) || 0;
        return bScore - aScore;
      })
      .slice(0, 5);
  };

  storeEmbeddings = async (note: Note) => {
    const key = "embeddings:initialized";
    const initialized = await actions.cache.get<boolean>(key);

    if (!initialized) {
      const results = await prisma.doc.findMany({
        where: { type: "DATABASE" },
      });

      for (const db of results.filter(isDatabaseDoc)) {
        const results = await prisma.doc.findMany({
          where: { id: { in: db.metadata.pageIds } },
        });

        for (const pages of chunk(results.filter(isPageDoc), 25)) {
          const notes = await Promise.all(
            pages.map(async (page) => {
              return this.prepareNote(page, await this.loadText(page));
            })
          );

          await actions.embeddings.store({ notes });
        }
      }

      await actions.cache.set(key, true);
    }

    await actions.embeddings.store({ notes: [note] });
  };

  prepareNote = (page: PageDoc, docs: string[]): Note => {
    return createNote(page.id, null, [
      createSection(null, null, [
        createSentence(null, null, [$pageTitle(page.data), ...docs].join(" ")),
      ]),
    ]);
  };

  loadText = async (doc: PageDoc | BlockDoc): Promise<string[]> => {
    const docs: string[] = [];
    const ids = doc.metadata.blockIds || [];

    const results = await prisma.doc.findMany({ where: { id: { in: ids } } });
    for (const result of results) {
      if (isBlockDoc(result)) {
        docs.push($blockText(result.data), ...(await this.loadText(result)));
      }
    }

    return docs;
  };

  shouldSkipStrategy = ({ data }: PageDoc): boolean => {
    if (!data.properties[this.key]) return true;
    if ($pageStatus(data)?.status?.name !== "Done") return true;
    return false;
  };
}
