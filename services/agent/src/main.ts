import dotenv from "dotenv";
dotenv.config();

import "./libs/sentry";
import cluster from "node:cluster";
import { syncFromNotion } from "./sync/syncFromNotion";
import { startServer } from "./server";

enum Worker {
  Server = "Server",
  SyncFromNotion = "SyncFromNotion",
  SyncToNotion = "SyncToNotion",
}

if (cluster.isPrimary) {
  cluster.fork({ WORKER: Worker.Server });
  cluster.fork({ WORKER: Worker.SyncFromNotion });

  cluster.on("disconnect", () => process.exit(1));
} else {
  const worker = process.env.WORKER;

  switch (worker) {
    case Worker.Server:
      startServer();
      break;
    case Worker.SyncFromNotion:
      syncFromNotion.start();
      break;
  }
}
