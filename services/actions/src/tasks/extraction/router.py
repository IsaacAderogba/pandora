from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Document
from src.tasks.extraction.keywords import attach_keywords

extraction_router = APIRouter()


class RequestBody(BaseModel):
    documents: List[Document]


@extraction_router.post("/keywords")
async def keywords(body: RequestBody):
    return attach_keywords(body.documents)
