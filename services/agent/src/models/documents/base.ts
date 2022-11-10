import { Doc } from "@prisma/client";
import {
  BlockDoc,
  CommentDoc,
  DatabaseDoc,
  PageDoc,
} from "../../libs/notion/types";
import { prisma } from "../../libs/prisma";
import { debug } from "../../utils/debug";

export const upsertDoc = async <
  T extends DatabaseDoc | PageDoc | CommentDoc | BlockDoc
>(
  doc: T
): Promise<T> => {
  await prisma.doc.upsert({
    where: { id: doc.id },
    create: doc,
    update: doc,
  });

  debug(`${doc.type.toLowerCase()} upserted, ${doc.title}`);
  return doc;
};

export const searchDocs = async (search: string) => {
  const query = search
    .replace(/[()|&:*!'"]/g, " ")
    .trim()
    .split(/\s+/)
    .join(" & ");

  const rawQuery = `
  SELECT id, "parentId", type, title, data, metadata, "createdAt", "updatedAt" FROM "Doc"
  WHERE
    "vector" @@ to_tsquery('english', '${query}')
  ORDER BY ts_rank("vector", to_tsquery('english', '${query}')) DESC
  LIMIT 10;
`;
  const results = await prisma.$queryRawUnsafe(rawQuery);
  return results as Doc[];
};
