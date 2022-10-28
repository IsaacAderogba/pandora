from typing import List, Union, Literal, TypedDict, Optional

Nullable = Optional
Id = str

Color = Union[
    Literal["default"],
    Literal["gray"],
    Literal["brown"],
    Literal["orange"],
    Literal["yellow"],
    Literal["green"],
    Literal["blue"],
    Literal["purple"],
    Literal["pink"],
    Literal["red"],
    Literal["gray_background"],
    Literal["brown_background"],
    Literal["orange_background"],
    Literal["yellow_background"],
    Literal["green_background"],
    Literal["blue_background"],
    Literal["purple_background"],
    Literal["pink_background"],
    Literal["red_background"],
]

class Annotation(TypedDict):
  bold: Nullable[bool]
  italic: Nullable[bool]
  strikethrough: Nullable[bool]
  underline: Nullable[bool]
  code: Nullable[bool]
  color: Nullable[Color]

class TextBody(TypedDict):
  content: str

class Text(TypedDict):
  text: TextBody
  annotations: Annotation
  plain_text: str
  href: Nullable[str]

class ParagraphBody(TypedDict):
  text: List[Text]
  color: Nullable[Color]

class Paragraph(TypedDict):
  id: Nullable[Id]
  paragraph: ParagraphBody

class Paper(TypedDict):
  id: Nullable[Id]
  paragraphs: List[Paragraph]
