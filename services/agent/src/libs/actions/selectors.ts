import { Document } from "./types";

export const $documentText = (document: Document) => {
  const texts: string[] = [];

  for (const section of document.sections) {
    for (const sentence of section.sentences) {
      texts.push(sentence.text);
    }
  }

  return texts;
};
