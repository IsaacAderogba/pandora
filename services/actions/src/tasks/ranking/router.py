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
    document_texts: List[str] = []

    for document in documents:
        sections: List[Section] = []
        section_sentences: List[Sentence] = []
        section_texts: List[str] = []

        for section in document["sections"]:
            document_sections.append(section)
            sections.append(section)

            sentences: List[Sentence] = []
            for sent in section["sentences"]:
                document_sentences.append(sent)
                section_sentences.append(sent)
                sentences.append(sent)

            sentence_texts = [sent["text"] for sent in sentences]
            sentence_context = " ".join(sentence_texts)
            section_texts.append(sentence_context)
            set_textrank(sentences, sentence_context, sentence_texts, "sentence_rank")

        section_context = " ".join(section_texts)
        document_texts.append(section_context)
        set_textrank(sections, section_context, section_texts, "section_rank")

        sentence_texts = [sent["text"] for sent in section_sentences]
        set_textrank(section_sentences, section_context, sentence_texts, "section_rank")

    document_context = " ".join(document_texts)
    set_textrank(documents, document_context, document_texts, "document_rank")

    section_texts: List[str] = []
    for section in document_sections:
        sentence_texts = [sent["text"] for sent in section["sentences"]]
        section_texts.append(" ".join(sentence_texts))
    set_textrank(document_sections, document_context, section_texts, "document_rank")

    sentence_texts = [sent["text"] for sent in document_sentences]
    set_textrank(document_sentences, document_context, sentence_texts, "document_rank")

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
