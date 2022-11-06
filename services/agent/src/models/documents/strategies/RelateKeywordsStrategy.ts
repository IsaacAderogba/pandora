import { $pageStage } from "../../../libs/notion/selectors";
import { PageDoc } from "../../../libs/notion/types";
import { PageStrategy } from "./Strategy";

export class RelateKeywordsStrategy implements PageStrategy {
  run: PageStrategy["run"] = async (_, page) => {
    if (this.shouldSkip(page)) return page;
    /**
     * Okay, so I have the updated page. What can I do with it?
     * 1. Make sure stage is not 0.
     * 2. Get all of its children and sub-children (don't need to be nested)
     */
    throw new Error("");
  };

  shouldSkip = ({ data }: PageDoc): boolean => {
    if ($pageStage(data)?.select?.name === "0") return true;
    return false;
  };
}
