import {
  BlockDoc,
  CommentDoc,
  DatabaseDoc,
  PageDoc,
} from "../libs/notion/types";
import { prisma } from "../libs/prisma";
import { cyan } from "../utils/colors";

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

  const header = `[${doc.type.toLowerCase()}-upserted]`;
  const label = `${new Date().toISOString()} ${doc.title}`;
  console.log(cyan, header, label);
  return doc;
};
