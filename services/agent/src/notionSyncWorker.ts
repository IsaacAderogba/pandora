import { notion } from "./libs/notion";

export const startNotionSyncWorker = () => {
  const one = notion.test(0);
  const two = notion.test(one);
  const three = notion.test(two);
  const four = notion.test(three);
  notion.test(four);
};
