export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ACTIONS_URL: string;
      NOTION_SECRET: string;
      READWISE_SECRET: string;
      SENTRY_DSN: string;
      WORKER: string;
    }
  }
}
