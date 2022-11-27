from typing import TypedDict, Any
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Note


embeddings_router = APIRouter()

class StoreBody(BaseModel):
    notes: list[Note]


@embeddings_router.post("/store")
async def store(body: StoreBody):
    return []

class SearchBodyOptions(TypedDict):
    limit: int

class SearchBody(BaseModel):
    notes: list[Note]

@embeddings_router.post("/search")
async def search(body: SearchBody):
    return []