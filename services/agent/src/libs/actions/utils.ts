import { Note, Section, Sentence } from "./types";

export const createNote = <T extends Note>(
  id: T["id"],
  metadata: T["metadata"],
  sections: T["sections"]
) => ({ id, metadata, sections }) as T;

export const createSection = <T extends Section>(
  id: T["id"],
  metadata: T["metadata"],
  sentences: T["sentences"]
) => ({ id, metadata, sentences }) as T;

export const createSentence = <T extends Sentence>(
  id: T["id"],
  metadata: T["metadata"],
  text: T["text"]
) => ({ id, metadata, text }) as T;
