import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import { healthRouter } from "./tasks/health/router";

const app: Express = express();

app.use("/health", healthRouter);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
