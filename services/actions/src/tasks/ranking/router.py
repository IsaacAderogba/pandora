from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Document, Section, Sentence
from src.tasks.ranking.algorithms import textrank

ranking_router = APIRouter()


class RequestBody(BaseModel):
    documents: List[Document]


def rank_documents(documents: List[Document]) -> List[Document]:
    local_documents: List[Document] = []
    global_sections: List[Section] = []

    for document in documents:
        local_documents.append(document)

        local_sections: List[Section] = []
        global_sentences: List[Sentence] = []
        section_sentence_texts: List[List[str]] = []

        for section in document["sections"]:
            global_sections.append(section)
            local_sections.append(section)

            local_sentences: List[Sentence] = []
            for sent in section["sentences"]:
                global_sentences.append(sent)
                local_sentences.append(sent)

            sentence_texts = [sent["text"] for sent in local_sentences]

            context = " ".join(sentence_texts)
            local_sent_rank = textrank(context, sentence_texts)
            for i, sentence_rank in enumerate(local_sent_rank):
                local_sentences[i]["metadata"] = {}
                local_sentences[i]["metadata"] = {"sentence_rank": sentence_rank}


        



    return documents


@ranking_router.post("/textrank")
async def extractive(body: RequestBody):
    return rank_documents(body.documents)
