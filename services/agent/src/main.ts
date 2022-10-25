import dotenv from "dotenv";
dotenv.config();

import cluster from "node:cluster";
import { syncFromNotion } from "./syncFromNotion";
import { startServer } from "./server";

enum Worker {
  Server = "Server",
  SyncFromNotion = "SyncFromNotion",
  SyncToNotion = "SyncToNotion",
  SyncFromReadwiseToNotion = "SyncFromReadwiseToNotion",
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
      syncFromNotion();
      break;
  }
}
