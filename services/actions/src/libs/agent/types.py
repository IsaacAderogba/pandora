from typing import List, Union, Literal, TypedDict, Optional

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
  bold: Optional[bool]
  italic: Optional[bool]
  strikethrough: Optional[bool]
  underline: Optional[bool]
  code: Optional[bool]
  color: Optional[Color]

class TextBody(TypedDict):
  content: str

class Text(TypedDict):
  text: TextBody
  annotations: Annotation
  plain_text: str
  href: Optional[str]

class ParagraphBody(TypedDict):
  text: List[Text]
  color: Optional[Color]

class Paragraph(TypedDict):
  id: Optional[Id]
  paragraph: ParagraphBody

class Paper(TypedDict):
  id: Optional[Id]
  paragraphs: List[Paragraph]
