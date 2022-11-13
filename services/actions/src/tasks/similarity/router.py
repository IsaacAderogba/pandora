from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Note
from src.tasks.similarity.cosine import cosine_similar_notes


similarity_router = APIRouter()


class RequestBody(BaseModel):
    text: str
    notes: list[Note]


@similarity_router.post("/cosine")
async def cosine(body: RequestBody):
    return cosine_similar_notes(body.text, body.notes)
