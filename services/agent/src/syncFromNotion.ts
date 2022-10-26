import { notion } from "./libs/notion/client";
import { $databaseDoc, $pageDoc } from "./libs/notion/selectors";
import {
  DatabaseDoc,
  DatabaseObjectResponse,
  PageDoc,
  PageObjectResponse,
} from "./libs/notion/types";
import { prisma } from "./libs/prisma";

export const syncFromNotion = async () => {
  while (true) {
    for (const db of await notion.databaseListAll()) {
      const dbDoc = await upsertDatabase(db);

      for (const page of await notion.pageListAll({ database_id: dbDoc.id })) {
        const pageDoc = await upsertPage(page);
      }
    }
  }
};

const upsertDatabase = async (db: DatabaseObjectResponse) =>
  upsertDoc($databaseDoc(db));

const upsertPage = async (page: PageObjectResponse) =>
  upsertDoc($pageDoc(page));

const upsertDoc = async <T extends DatabaseDoc | PageDoc>(
  doc: T
): Promise<T> => {
  await prisma.doc.upsert({
    where: { id: doc.id },
    create: doc,
    update: doc,
  });
  console.log(`[${doc.type.toLowerCase()}-upserted]: ${doc.title}`);
  return doc;
};
