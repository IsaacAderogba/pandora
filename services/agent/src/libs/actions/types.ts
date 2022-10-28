import { Optional } from "../../utils/type";

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
  bold: Optional<boolean>;
  italic: Optional<boolean>;
  strikethrough: Optional<boolean>;
  underline: Optional<boolean>;
  code: Optional<boolean>;
  color: Color;
};

export type TextBody = {
  content: string;
};

export type Text = {
  text: TextBody;
  annotations: Annotation;
  plain_text: string;
  href: Optional<string>;
};

export type ParagraphBody = {
  text: Text[];
  color: Optional<Color>;
};

export type Paragraph = {
  id: Optional<Id>;
  paragraph: ParagraphBody;
};

export type Paper = {
  id: Optional<Id>;
  paragraphs: Paragraph[];
};
