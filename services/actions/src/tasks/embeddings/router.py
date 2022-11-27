from typing import TypedDict
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.spacy.nlp import create_cleaned_doc
from src.libs.spacy.types import Doc
from src.utils.text import extract_note_text
from src.libs.agent.types import Note


embeddings: dict[str, Doc] = {}
embeddings_router = APIRouter()


class StoreBody(BaseModel):
    notes: list[Note]


@embeddings_router.post("/store")
async def store(body: StoreBody):
    for note in body.notes:
        if note["id"] != None:
            doc = create_cleaned_doc(extract_note_text(note))
            embeddings[note["id"]] = doc

    return True


class SearchBodyOptions(TypedDict):
    limit: int


class SearchBody(BaseModel):
    options: SearchBodyOptions
    notes: list[Note]


@embeddings_router.post("/search")
async def search(body: SearchBody):
    limit = body.options["limit"]
    items = embeddings.items()

    for note in body.notes:
        doc = create_cleaned_doc(extract_note_text(note))
        similarities: list[tuple[str, float]] = []

        for key, value in items:
            similarities.append((key, doc.similarity(value)))

        if note["metadata"] is None:
            note["metadata"] = {}

        sorted_similarities = sorted(similarities, key=lambda item: -item[1])
        note["metadata"]["embeddings_search"] = sorted_similarities[:limit]

    return body.notes
