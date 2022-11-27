from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel

cache_router = APIRouter()
cache: dict[str, Any] = {}


class CacheSetBody(BaseModel):
    value: Any


@cache_router.post("/set/{key}")
async def set_cache(key: str, value: CacheSetBody):
    cache[key] = value
    return value


@cache_router.get("/get/{key}")
async def get_cache(key: str):
    if key in cache:
        return cache[key]

    return None
