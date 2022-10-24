export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NOTION_SECRET: string;
    }
  }
}
