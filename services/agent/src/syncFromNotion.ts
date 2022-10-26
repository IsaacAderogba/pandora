import { notion } from "./libs/notion/client";
import { $databaseTitle, $pageTitle } from "./libs/notion/selectors";

export const syncFromNotion = async () => {
  while (true) {
    const databases = await notion.databaseListAll();
    for (const db of databases) {
      console.log(`[db-sync]: ${$databaseTitle(db)}`);

      const pages = await notion.pageListAll({ database_id: db.id });
      for (const page of pages) {
        console.log(`[page-sync]: ${$pageTitle(page)}`);
      }
    }
  }
};
