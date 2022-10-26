import { notion } from "./libs/notion/client";

export const syncFromNotion = async () => {
  const databases = await notion.databaseRecursivelyList();

  console.log(databases);
};
