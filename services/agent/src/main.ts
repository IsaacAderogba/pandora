import path from "path";
import { Worker } from "worker_threads";

new Worker(path.join(__dirname, "serverWorker.ts"));
