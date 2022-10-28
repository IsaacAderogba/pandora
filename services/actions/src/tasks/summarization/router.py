from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Paragraph

summarization_router = APIRouter()


class RequestBody(BaseModel):
    data: List[Paragraph]


@summarization_router.post("/extractive")
async def extractive(body: RequestBody):
    print(body)
    return {"message": "up and running"}
