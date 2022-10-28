import { Nullable } from "../../utils/types";

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

export type TextBody = {
  content: string;
};

export type Text = {
  text: TextBody;
  annotations: Annotation;
  plain_text: string;
  href: Nullable<string>;
};

export type ParagraphBody = {
  text: Text[];
  color: Nullable<Color>;
};

export type Paragraph = {
  id: Nullable<Id>;
  paragraph: ParagraphBody;
};

export type Paper = {
  id: Nullable<Id>;
  paragraphs: Paragraph[];
};
