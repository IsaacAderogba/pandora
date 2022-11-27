from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel

cache_router = APIRouter()
cache: dict[str, Any] = {}


class CacheBody(BaseModel):
    key: str
    value: Any


@cache_router.post("/set")
async def set_cache(body: CacheBody):
    cache[body.key] = body.value
    return body.value


@cache_router.get("/get")
async def get_cache(body: CacheBody):
    if body.key in cache:
        return cache[body.key]
    return None
