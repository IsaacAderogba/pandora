import { Note } from "./types";

export const $noteText = (note: Note) => {
  const texts: string[] = [];

  for (const section of note.sections) {
    for (const sentence of section.sentences) {
      texts.push(sentence.text);
    }
  }

  return texts;
};
