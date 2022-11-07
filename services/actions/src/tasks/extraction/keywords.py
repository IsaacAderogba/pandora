import re
import string
from typing import List, Union
from fastapi import APIRouter

from src.libs.spacy.nlp import nlp, stopwords
from src.libs.agent.types import Note, Section, Sentence

extraction_router = APIRouter()


def attach_keywords(notes: list[Note]) -> list[Note]:
    note_texts: List[str] = []

    for note in notes:
        sections: List[Section] = []
        section_texts: List[str] = []

        for section in note["sections"]:
            sections.append(section)

            sentences: List[Sentence] = []
            for sent in section["sentences"]:
                sentences.append(sent)

            sentence_texts = [sent["text"] for sent in sentences]
            sentence_context = " ".join(sentence_texts)
            section_texts.append(sentence_context)
            set_keywords(sentences, sentence_texts)

        section_context = " ".join(section_texts)
        note_texts.append(section_context)
        set_keywords(sections, section_texts)

    set_keywords(notes, note_texts)

    return notes


def set_keywords(
    data: Union[List[Note], List[Section], List[Sentence]],
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

    tags = {"NOUN", "PROPN"}
    blacklist = {"summary"}
    for phrase in doc._.phrases[:15]:
        chunk = phrase.chunks[0]

        if any(p in chunk.text for p in string.punctuation):
            continue
        if len(chunk) < 2 or len(chunk) > 3:
            continue

        doc_chunk = nlp(chunk.text)
        if len(doc.ents) > 0:
            continue

        lemmas: list[str] = []

        has_stopword = False
        has_adjective = False
        has_blacklist = False
        for token in doc_chunk:
            text = token.text.lower()
            if token.pos_ not in tags:
                has_adjective = True

            if text in stopwords or len(text) <= 2:
                has_stopword = True

            if text in blacklist:
                has_blacklist = True

            lemmas.append(token.lemma_.lower())

        if has_stopword == True or has_adjective == True or has_blacklist == True:
            continue

        id: str = " ".join(lemmas)
        term = id.title()
        rank = phrase.rank
        results.append((id, term, rank))

    return results
