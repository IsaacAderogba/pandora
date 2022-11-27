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
            pages.map(async (page) =>
              this.prepareNote(page, await this.loadBlocks(page))
            )
          );

          await actions.embeddings.store({ notes });
        }
      }

      await actions.cache.set(key, true);
    }

    await actions.embeddings.store({
      notes: [this.prepareNote(page, await this.loadBlocks(page))],
    });
  };

  prepareNote = (page: PageDoc, docs: BlockDoc[]): Note => {
    return createNote(
      page.id,
      null,
      docs.map((block) => {
        const text = $blockText(block.data);
        const sentences = [$pageTitle(page.data), text];

        return createSection(
          block.id,
          null,
          sentences.map((sentence) => createSentence(null, null, sentence))
        );
      })
    );
  };

  loadBlocks = async (doc: PageDoc | BlockDoc): Promise<BlockDoc[]> => {
    const docs: BlockDoc[] = [];
    const ids = doc.metadata.blockIds;

    const results = await prisma.doc.findMany({ where: { id: { in: ids } } });
    for (const result of results) {
      if (isBlockDoc(result)) {
        docs.push(result, ...(await this.loadBlocks(result)));
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
