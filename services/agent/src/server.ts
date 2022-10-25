import express, { Express } from "express";
import { healthRouter } from "./server/health/router";

const app: Express = express();

app.use("/health", healthRouter);

export const startServer = () => {
  const port = process.env.PORT ?? 3000;
  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
};
