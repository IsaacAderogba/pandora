import { Nullable } from "../../utils/types";

export type Id = string | number;

export type Color =
  | "default"
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "gray_background"
  | "brown_background"
  | "orange_background"
  | "yellow_background"
  | "green_background"
  | "blue_background"
  | "purple_background"
  | "pink_background"
  | "red_background";

export type Annotation = {
  bold: Nullable<boolean>;
  italic: Nullable<boolean>;
  strikethrough: Nullable<boolean>;
  underline: Nullable<boolean>;
  code: Nullable<boolean>;
  color: Color;
};

export type Sentence<R = null> = {
  text: string;
  metadata: R;
};

export type Section<K = null, R = null> = {
  id: Nullable<Id>;
  sentences: Sentence<R>[];
  metadata: K;
};

export type Note<T = null, K = null, R = null> = {
  id: Nullable<Id>;
  sections: Section<K, R>[];
  metadata: T;
};
