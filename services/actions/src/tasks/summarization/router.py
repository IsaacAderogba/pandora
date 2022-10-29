from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Document
from src.libs.spacy.nlp import nlp

summarization_router = APIRouter()


class RequestBody(BaseModel):
    documents: List[Document]


# literally just a processing step
def rank_documents(documents: List[Document]) -> List[Document]:
    ranked_documents: List[Document] = []




    return documents
    #1 rank documents
    #2 rank sections
    #3 rank texts

@summarization_router.post("/extractive")
async def extractive(body: RequestBody):
    ranked_documents = rank_documents("")

    return {"message": "up and running"}
