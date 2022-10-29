from typing import List, Union
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Document, Section, Sentence
from src.tasks.ranking.textrank import textrank

ranking_router = APIRouter()


class RequestBody(BaseModel):
    documents: List[Document]


def rank_documents(documents: List[Document]) -> List[Document]:
    local_documents: List[Document] = []
    global_sections: List[Section] = []
    document_sentences: List[Sentence] = []
    document_contexts: List[str] = []

    for document in documents:
        local_documents.append(document)

        local_sections: List[Section] = []
        section_sentences: List[Sentence] = []
        section_contexts: List[str] = []

        for section in document["sections"]:
            global_sections.append(section)
            local_sections.append(section)

            sentences: List[Sentence] = []
            for sent in section["sentences"]:
                document_sentences.append(sent)
                section_sentences.append(sent)
                sentences.append(sent)

            sent_texts = [sent["text"] for sent in sentences]
            context = " ".join(sent_texts)
            section_contexts.append(context)
            set_textrank(sentences, context, sent_texts, "sentence_rank")

        context = " ".join(section_contexts)
        document_contexts.append(context)

        sect_sent_texts = [sent["text"] for sent in section_sentences]
        set_textrank(section_sentences, context, sect_sent_texts, "section_rank")

    context = " ".join(document_contexts)
    doc_sent_texts = [sent["text"] for sent in document_sentences]
    set_textrank(document_sentences, context, doc_sent_texts, "document_rank")

    return documents


def set_textrank(
    data: Union[List[Document], List[Section], List[Sentence]],
    context: str,
    texts: List[str],
    key: str,
):
    ranks = textrank(context, texts)
    for i, rank in enumerate(ranks):
        if data[i]["metadata"] is None:
            data[i]["metadata"] = {}
            
        data[i]["metadata"][key] = rank


@ranking_router.post("/textrank")
async def extractive(body: RequestBody):
    return rank_documents(body.documents)
