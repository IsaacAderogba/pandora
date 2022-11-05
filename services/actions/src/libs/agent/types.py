from typing import Any, List, Union, Literal, TypedDict, Optional

Id = Union[str, int]

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


class Sentence(TypedDict):
    id: Optional[Id]
    text: str
    metadata: Any


class Section(TypedDict):
    id: Optional[Id]
    sentences: List[Sentence]
    metadata: Any


class Document(TypedDict):
    id: Optional[Id]
    sections: List[Section]
    metadata: Any
