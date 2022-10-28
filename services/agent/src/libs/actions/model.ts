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
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: Color;
};

export type Text = {
  type: "text";
  text: {
    content: string;
    link?: {
      url: string;
    };
  };
  annotations: Annotation;
  plain_text: string;
  href: string | null;
};

export type Paragraph = {
  id?: string;
  type: "paragraph";
  paragraph: {
    text: Text[];
    color?: Color;
  };
};

export type Paper = {
  id?: string;
  type: "paper";
  paragraphs: Paragraph[];
};
