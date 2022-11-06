from typing import TypedDict
from fastapi import APIRouter
from pydantic import BaseModel

from src.tasks.summarization.extractive import summarize_notes_extractively
from src.libs.agent.types import Note


summarization_router = APIRouter()


class RequestBodyOptions(TypedDict):
    num_sentences: int


class RequestBody(BaseModel):
    notes: list[Note]
    options: RequestBodyOptions


@summarization_router.post("/extractive")
async def extractive(body: RequestBody):
    return summarize_notes_extractively(
        body.notes, body.options["num_sentences"]
    )
