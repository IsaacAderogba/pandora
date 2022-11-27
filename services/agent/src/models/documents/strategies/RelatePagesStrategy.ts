import { chunk } from "lodash";
import { actions } from "../../../libs/actions/client";
import { Note } from "../../../libs/actions/types";
import {
  createNote,
  createSection,
  createSentence,
} from "../../../libs/actions/utils";
import {
  isBlockDoc,
  isDatabaseDoc,
  isPageDoc,
} from "../../../libs/notion/narrowings";
import {
  $blockText,
  $pageStatus,
  $pageTitle,
} from "../../../libs/notion/selectors";
import { BlockDoc, PageDoc } from "../../../libs/notion/types";
import { prisma } from "../../../libs/prisma";
import { PageStrategy } from "./Strategy";

export class RelatePagesStrategy implements PageStrategy {
  run: PageStrategy["run"] = async (_, page) => {
    await this.storeEmbeddings(page);
    if (this.shouldSkipStrategy(page)) return page;

    return page;
  };

  storeEmbeddings = async (page: PageDoc) => {
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

        for (const pages of chunk(results.filter(isPageDoc), 20)) {
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

    await actions.embeddings.store({
      notes: [this.prepareNote(page, await this.loadText(page))],
    });
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
    if (!data.properties["Related"]) return true;
    if ($pageStatus(data)?.status?.name !== "Done") return true;
    return false;
  };
}
