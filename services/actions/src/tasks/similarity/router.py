from typing import TypedDict
from fastapi import APIRouter
from pydantic import BaseModel

from src.tasks.summarization.extractive import summarize_notes_extractively
from src.libs.agent.types import Note


similarity_router = APIRouter()


class RequestBody(BaseModel):
    notes: list[Note]


@similarity_router.post("/extractive")
async def extractive(body: RequestBody):
    return []
