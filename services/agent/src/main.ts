import dotenv from "dotenv";
dotenv.config();

import cluster from "node:cluster";
import { startNotionSyncWorker } from "./notionSyncWorker";
import { startServer } from "./serverWorker";

enum Worker {
  Server = "Server",
  NotionSync = "NotionSync",
}

if (cluster.isPrimary) {
  cluster.fork({ WORKER: Worker.Server });
  cluster.fork({ WORKER: Worker.NotionSync });

  cluster.on("disconnect", () => process.exit(1));
} else {
  const worker = process.env.WORKER;

  switch (worker) {
    case Worker.Server:
      startServer();
      break;
    case Worker.NotionSync:
      startNotionSyncWorker();
      break;
  }
}
