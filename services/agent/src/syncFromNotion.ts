import { notion } from "./libs/notion/client";
import { $databaseDoc, $pageTitle } from "./libs/notion/selectors";
import { DatabaseObjectResponse } from "./libs/notion/types";
import { prisma } from "./libs/prisma";

export const syncFromNotion = async () => {
  while (true) {
    const databases = await notion.databaseListAll();
    for (const db of databases) {
      const dbDoc = await upsertDatabase(db);

      const pages = await notion.pageListAll({ database_id: dbDoc.id });
      for (const page of pages) {
        console.log(`[page-sync]: ${$pageTitle(page)}`);

        /**
         * For each page, I need to grab the properties
         */
      }
    }
  }
};

const upsertDatabase = async (db: DatabaseObjectResponse) => {
  const dbDoc = $databaseDoc(db);
  const result = await prisma.doc.upsert({
    where: { id: dbDoc.id },
    create: dbDoc,
    update: dbDoc,
  });
  console.log(`[db-upserted]: ${result.title}`);
  return dbDoc;
};
