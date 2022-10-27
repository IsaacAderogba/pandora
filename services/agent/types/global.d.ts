export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NOTION_SECRET: string;
      SENTRY_DSN: string;
      WORKER: string;
    }
  }
}
