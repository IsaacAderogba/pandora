from typing import List, Union
from fastapi import APIRouter
from pydantic import BaseModel

from src.libs.agent.types import Document, Section, Sentence
from src.tasks.ranking.textrank import textrank

ranking_router = APIRouter()


class RequestBody(BaseModel):
    documents: List[Document]


def rank_documents(documents: List[Document]) -> List[Document]:
    docs: List[Document] = []
    document_sections: List[Section] = []
    document_sentences: List[Sentence] = []
    document_texts: List[str] = []

    for document in documents:
        docs.append(document)

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
            context = " ".join(sentence_texts)
            section_texts.append(context)
            set_textrank(sentences, context, sentence_texts, "sentence_rank")

        context = " ".join(section_texts)
        document_texts.append(context)
        set_textrank(sections, context, section_texts, "section_rank")

        sect_sentence_texts = [sent["text"] for sent in section_sentences]
        set_textrank(section_sentences, context, sect_sentence_texts, "section_rank")

    context = " ".join(document_texts)

    doc_sentence_texts = [sent["text"] for sent in document_sentences]
    set_textrank(document_sentences, context, doc_sentence_texts, "document_rank")

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
