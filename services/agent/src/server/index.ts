import express, { Express } from "express";
import { debug } from "../utils/debug";
import { healthRouter } from "./health/router";

const app: Express = express();

app.use("/health", healthRouter);

export const startServer = () => {
  const port = process.env.PORT ?? 3000;
  app.listen(port, () => {
    debug(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
};
