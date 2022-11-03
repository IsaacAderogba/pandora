export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ACTIONS_URL: string;
      NOTION_SECRET: string;
      PANDORA_ICON_URL: string;
      READWISE_SECRET: string;
      SENTRY_DSN: string;
      SOURCES_DATABASE_ID: string;
      WORKER: string;
    }
  }
}
