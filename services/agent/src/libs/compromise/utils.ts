import { nlp } from "./nlp";

export const tokenizeSentences = (text: string) => {
  return nlp(text)
    .json()
    .map((o: { text: string }) => o.text);
};
