from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Document, Section, Text
from src.libs.spacy.nlp import nlp

summarization_router = APIRouter()


class RequestBody(BaseModel):
    documents: List[Document]


# literally just a processing step
def rank_documents(documents: List[Document]) -> List[Document]:
    ranked_documents: List[Document] = []

    for document in documents:
        ranked_sections: List[Section] = []

        for section in document["sections"]:
            ranked_texts: List[Text] = []

            for sentence in section["sentences"]:
                text_doc = nlp(sentence["text"])
                pass




    return documents
    #1 So I want to create a doc out of each text

@summarization_router.post("/extractive")
async def extractive(body: RequestBody):
    ranked_documents = rank_documents(body.documents)

    return {"message": "up and running"}
