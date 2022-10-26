import { notion } from "./libs/notion/client";
import { $databaseDoc, $pageTitle } from "./libs/notion/selectors";
import { DatabaseObjectResponse } from "./libs/notion/types";
import { prisma } from "./libs/prisma";

export const syncFromNotion = async () => {
  while (true) {
    for (const db of await notion.databaseListAll()) {
      const dbDoc = await upsertDatabase(db);

      for (const page of await notion.pageListAll({ database_id: dbDoc.id })) {
        console.log(`[page-sync]: ${$pageTitle(page)}`);
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
