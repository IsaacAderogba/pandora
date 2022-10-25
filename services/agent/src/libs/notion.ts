import { Client } from "@notionhq/client";

class Notion {
  client = new Client({
    auth: process.env.NOTION_SECRET,
    notionVersion: "2022-06-28",
  });

  test(num: number) {
    console.log(num);
    return num + 1;
  }
}

export const notion = new Notion();
