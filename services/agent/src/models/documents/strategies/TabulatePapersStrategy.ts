import { PageStrategy } from "./Strategy";

export class TabulatePapersStrategy implements PageStrategy {
  run: PageStrategy["run"] = async (_, page) => {
    return page;
  };
}
