from fastapi import APIRouter
from pydantic import BaseModel

summarization_router = APIRouter()


@summarization_router.post("/extractive")
async def extractive():
    return {"message": "up and running"}
