import dotenv from "dotenv";
dotenv.config();

import "./libs/sentry";
import cluster from "node:cluster";
import { syncNotion } from "./syncNotion";
import { startServer } from "./server";
import { Worker } from "./utils/enums";
import { automateNotion } from "./automateNotion";
import { syncReadwise } from "./syncReadwise";

if (cluster.isPrimary) {
  cluster.fork({ WORKER: Worker.Server });
  cluster.fork({ WORKER: Worker.SyncNotion });
  cluster.fork({ WORKER: Worker.AutomateNotion });
  cluster.fork({ WORKER: Worker.SyncReadwise });

  cluster.on("exit", () => {
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      if (worker) worker.kill();
    }

    process.exit(0);
  });
} else {
  const worker = process.env.WORKER;

  switch (worker) {
    // case Worker.Server:
    //   startServer();
    //   break;
    // case Worker.SyncNotion:
    //   syncNotion();
    //   break;
    case Worker.AutomateNotion:
      automateNotion();
      break;
    // case Worker.SyncReadwise:
    //   syncReadwise();
    //   break;
  }
}
