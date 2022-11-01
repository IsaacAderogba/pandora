from typing import TypedDict
from fastapi import APIRouter
from pydantic import BaseModel

from src.tasks.summarization.extractive import summarize_documents_extractively
from src.libs.agent.types import Document


summarization_router = APIRouter()


class RequestBodyOptions(TypedDict):
    num_sentences: int


class RequestBody(BaseModel):
    documents: list[Document]
    options: RequestBodyOptions


@summarization_router.post("/extractive")
async def extractive(body: RequestBody):
    return summarize_documents_extractively(
        body.documents, body.options["num_sentences"]
    )
