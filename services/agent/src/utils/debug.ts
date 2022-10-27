import { colors } from "./colors";
import { Worker } from "./enums";

const WorkerColors: { [key: string]: string } = {
  [Worker.Server]: colors.fg.blue,
  [Worker.SyncNotion]: colors.fg.green,
  [Worker.AutomateNotion]: colors.fg.red,
};

const color = WorkerColors[process.env.WORKER];
export const debug: typeof console.log = (...args) => {
  console.log(color, `[${new Date().toISOString()}:${process.env.WORKER}]`, ...args);
};
