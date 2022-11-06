import { PageStrategy } from "./Strategy";

export class RelateKeywordsStrategy implements PageStrategy {
  run: PageStrategy["run"] = async () => {
    throw new Error("");
  };
}
