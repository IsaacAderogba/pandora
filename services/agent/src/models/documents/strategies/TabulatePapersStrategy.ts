import { Note } from "../../../libs/actions/types";
import {
  createNote,
  createSection,
  createSentence,
} from "../../../libs/actions/utils";
import { isBlockDoc } from "../../../libs/notion/narrowings";
import {
  $pageStatus,
  $pageTitle,
  $parentId,
  $richTextsPlainText,
} from "../../../libs/notion/selectors";
import { PageDoc } from "../../../libs/notion/types";
import { prisma } from "../../../libs/prisma";
import { scholar } from "../../../libs/scholar/client";
import { Paper } from "../../../libs/scholar/types";
import { KEYWORDS_DATABASE_ID } from "../../../utils/consts";
import { PageStrategy } from "./Strategy";

export class TabulatePapersStrategy implements PageStrategy {
  run: PageStrategy["run"] = async (_, page) => {
    if (await this.shouldSkipStrategy(page)) return page;
    const { data: papers } = await scholar.paperSearch({
      query: $pageTitle(page.data),
      limit: 100,
    });

    return page;
  };

  shouldSkipStrategy = async ({
    data,
    metadata,
  }: PageDoc): Promise<boolean> => {
    if ($pageStatus(data)?.status?.name !== "Done") return true;
    if ($parentId(data.parent) !== KEYWORDS_DATABASE_ID) return true;

    const ids = metadata.blockIds;
    const children = await prisma.doc.findMany({ where: { id: { in: ids } } });

    return children.filter(isBlockDoc).some(({ data }) => {
      if (data.type === "table_row") {
        return data.table_row.cells.map(
          (cell) => $richTextsPlainText(cell) === "Paper"
        );
      }
      return false;
    });
  };

  createActionNotes = (papers: Paper[]): Note[] => {
    return papers.map(({ paperId, title, abstract }) =>
      createNote(paperId, null, [
        createSection(
          null,
          null,
          [title, abstract].map((text) => createSentence(null, null, text))
        ),
      ])
    );
  };
}
