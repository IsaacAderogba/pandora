import { notion } from "./libs/notion";

export const startNotionSyncWorker = async () => {
  const one = await notion.test(0);
  const two = await notion.test(one);
  const three = await notion.test(two);
  const four = await notion.test(three);
  await notion.test(four);
};
