from typing import List, Union
from fastapi import APIRouter

from src.libs.spacy.nlp import nlp, stopwords
from src.libs.agent.types import Document, Section, Sentence

extraction_router = APIRouter()


def attach_keywords(documents: list[Document]) -> list[Document]:
    document_texts: List[str] = []

    for document in documents:
        sections: List[Section] = []
        section_texts: List[str] = []

        for section in document["sections"]:
            sections.append(section)

            sentences: List[Sentence] = []
            for sent in section["sentences"]:
                sentences.append(sent)

            sentence_texts = [sent["text"] for sent in sentences]
            sentence_context = " ".join(sentence_texts)
            section_texts.append(sentence_context)
            set_keywords(sentences, sentence_texts)

        section_context = " ".join(section_texts)
        document_texts.append(section_context)
        set_keywords(sections, section_texts)

    set_keywords(documents, document_texts)

    return documents


def set_keywords(
    data: Union[List[Document], List[Section], List[Sentence]],
    texts: List[str],
):
    for i, text in enumerate(texts):
        results = keywords_rank(text)

        for id, term, rank in results:
            if data[i]["metadata"] is None:
                data[i]["metadata"] = {}

            if "keywords" not in data[i]["metadata"]:
                data[i]["metadata"]["keywords"] = {}

            data[i]["metadata"]["keywords"][id] = {"term": term, "rank": rank}


def keywords_rank(text: str):
    results: list[tuple[str, str, float]] = []

    doc = nlp(text)
    for phrase in doc._.phrases[:10]:
        chunk = phrase.chunks[0]

        if chunk.label_ != "NP":
            continue
        if len(chunk) < 2:
            continue

        has_stopword = False
        for word in chunk.text.split():
            if word.lower() in stopwords:
                has_stopword = True
        if has_stopword == True:
          continue

        id = chunk.lemma_.lower()
        term = chunk.text.title()
        rank = phrase.rank
        results.append((id, term, rank))

    return results
