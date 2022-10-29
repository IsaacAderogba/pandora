from typing import List, Union
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Document, Section, Sentence
from src.tasks.ranking.textrank import textrank

ranking_router = APIRouter()


class RequestBody(BaseModel):
    documents: List[Document]


def rank_documents(documents: List[Document]) -> List[Document]:
    document_sections: List[Section] = []
    document_sentences: List[Sentence] = []
    section_contexts: List[str] = []

    for document in documents:
        sections: List[Section] = []
        section_sentences: List[Sentence] = []
        sentence_contexts: List[str] = []

        for section in document["sections"]:
            document_sections.append(section)
            sections.append(section)

            sentences: List[Sentence] = []
            for sent in section["sentences"]:
                document_sentences.append(sent)
                section_sentences.append(sent)
                sentences.append(sent)

            texts = [sent["text"] for sent in sentences]
            sentence_context = " ".join(texts)
            sentence_contexts.append(sentence_context)
            set_textrank(sentences, sentence_context, texts, "sentence_rank")

        section_context = " ".join(sentence_contexts)
        section_contexts.append(section_context)
        set_textrank(sections, section_context, sentence_contexts, "section_rank")

        texts = [sent["text"] for sent in section_sentences]
        set_textrank(section_sentences, section_context, texts, "section_rank")

    context = " ".join(section_contexts)
    set_textrank(documents, context, section_contexts, "document_rank")

    # doc_section_sentences = [sect["sentences"] for sect in document_sections]   
    # i need to get the section texts 

    texts = [sent["text"] for sent in document_sentences]
    set_textrank(document_sentences, context, texts, "document_rank")

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
