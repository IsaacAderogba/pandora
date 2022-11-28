import os
import glob
from pathlib import Path
from typing import TypedDict
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.spacy.nlp import create_cleaned_doc, nlp
from src.libs.spacy.types import Doc
from src.utils.text import extract_note_text
from src.libs.agent.types import Note


def get_embeddings_path(filename: str):
    return os.path.join(
        os.getcwd(),
        "src",
        "tasks",
        "embeddings",
        "__pandora__",
        filename,
    )


embeddings_router = APIRouter()


class StoreBody(BaseModel):
    notes: list[Note]


@embeddings_router.post("/store")
async def store(body: StoreBody):
    for note in body.notes:
        if note["id"] != None:
            doc = create_cleaned_doc(extract_note_text(note))
            path = get_embeddings_path(
                f'{note["id"]}.txt',
            )

            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "wb") as f:
                f.write(doc.to_bytes(exclude=['user_data_keys', 'user_data_values']))

    return True


class SearchBodyOptions(TypedDict):
    limit: int


class SearchBody(BaseModel):
    options: SearchBodyOptions
    notes: list[Note]


@embeddings_router.post("/search")
async def search(body: SearchBody):
    limit = body.options["limit"]

    path = get_embeddings_path('*.txt')
    paths = glob.iglob(path)

    for note in body.notes:
        doc = create_cleaned_doc(extract_note_text(note))
        similarities: list[tuple[str, float]] = []

        for path in paths:
            key = Path(path).stem
            value = Doc(nlp.vocab).from_disk(path)
            similarities.append((key, doc.similarity(value)))

        if note["metadata"] is None:
            note["metadata"] = {}

        sorted_similarities = sorted(similarities, key=lambda item: -item[1])
        note["metadata"]["embeddings_search"] = sorted_similarities[:limit]

    return body.notes
