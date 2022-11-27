import { actions } from "../../../libs/actions/client";
import { $pageStatus } from "../../../libs/notion/selectors";
import { PageDoc } from "../../../libs/notion/types";
import { PageStrategy } from "./Strategy";

export class RelatePagesStrategy implements PageStrategy {
  run: PageStrategy["run"] = async (_, page) => {
    await this.storeEmbeddings(page);
    if (this.shouldSkipStrategy(page)) return page;

    return page;
  };

  storeEmbeddings = async (page: PageDoc) => {
    const key = "embeddings:initialized";
    const initialized = await actions.cache.get<boolean>(key);

    if (!initialized) {
      // do initialization
      await actions.cache.set(key, true);
    }
  };

  shouldSkipStrategy = ({ data }: PageDoc): boolean => {
    if (!data.properties["Related"]) return true;
    if ($pageStatus(data)?.status?.name !== "Done") return true;
    return false;
  };
}
