from typing import Any, List, Union, Literal, TypedDict, Optional

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

class Text(TypedDict):
  text: str
  annotations: Annotation
  href: Nullable[str]
  metadata: Any

class Section(TypedDict):
  id: Nullable[Id]
  texts: List[Text]
  metadata: Any

class Document(TypedDict):
  id: Nullable[Id]
  sections: List[Section]
  metadata: Any
