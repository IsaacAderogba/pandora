from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Note
from src.tasks.ranking.textrank import rank_notes

ranking_router = APIRouter()


class RequestBody(BaseModel):
    notes: List[Note]


@ranking_router.post("/textrank")
async def textrank(body: RequestBody):
    return rank_notes(body.notes)
