from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Document
from src.tasks.ranking.textrank import rank_documents

ranking_router = APIRouter()


class RequestBody(BaseModel):
    documents: List[Document]


@ranking_router.post("/textrank")
async def textrank(body: RequestBody):
    return rank_documents(body.documents)
