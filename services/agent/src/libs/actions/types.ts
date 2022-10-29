import { Nullable, Any } from "../../utils/types";

export type Id = string;

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

export type Text<R = Any> = {
  text: string;
  annotations: Annotation;
  href: Nullable<string>;
  metadata: R;
};

export type Section<K = Any, R = Any> = {
  id: Nullable<Id>;
  texts: Text<R>[];
  metadata: K;
};

export type Document<T = Any, K = Any, R = Any> = {
  id: Nullable<Id>;
  sections: Section<K, R>[];
  metadata: T;
};
