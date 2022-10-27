import {
  BlockDoc,
  CommentDoc,
  DatabaseDoc,
  PageDoc,
} from "../libs/notion/types";
import { prisma } from "../libs/prisma";
import { debug } from "../utils/debug";

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
