from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Document

extraction_router = APIRouter()

def attach_keywords(documents: list[Document]) -> list[Document]:
  return documents


class RequestBody(BaseModel):
    documents: List[Document]


@extraction_router.post("/keywords")
async def keywords(body: RequestBody):
    return attach_keywords(body.documents)
