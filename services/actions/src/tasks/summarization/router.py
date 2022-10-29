from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Document

summarization_router = APIRouter()


class RequestBody(BaseModel):
    documents: List[Document]


@summarization_router.post("/extractive")
async def extractive(body: RequestBody):
    return {"message": "up and running"}
