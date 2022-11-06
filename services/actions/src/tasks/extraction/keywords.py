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
        term = id.title()
        rank = phrase.rank
        results.append((id, term, rank))

    return results
