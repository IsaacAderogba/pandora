from math import sqrt
from typing import List, Union
from src.libs.spacy.nlp import nlp
from src.libs.agent.types import Note, Section, Sentence


def rank_notes(notes: List[Note]) -> List[Note]:
    note_sections: List[Section] = []
    note_sentences: List[Sentence] = []
    note_texts: List[str] = []

    for note in notes:
        sections: List[Section] = []
        section_sentences: List[Sentence] = []
        section_texts: List[str] = []

        for section in note["sections"]:
            note_sections.append(section)
            sections.append(section)

            sentences: List[Sentence] = []
            for sent in section["sentences"]:
                note_sentences.append(sent)
                section_sentences.append(sent)
                sentences.append(sent)

            sentence_texts = [sent["text"] for sent in sentences]
            sentence_context = " ".join(sentence_texts)
            section_texts.append(sentence_context)
            set_textrank(sentences, sentence_context, sentence_texts, "sentence_rank")

        section_context = " ".join(section_texts)
        note_texts.append(section_context)
        set_textrank(sections, section_context, section_texts, "section_rank")

        sentence_texts = [sent["text"] for sent in section_sentences]
        set_textrank(section_sentences, section_context, sentence_texts, "section_rank")

    note_context = " ".join(note_texts)
    set_textrank(notes, note_context, note_texts, "note_rank")

    section_texts: List[str] = []
    for section in note_sections:
        sentence_texts = [sent["text"] for sent in section["sentences"]]
        section_texts.append(" ".join(sentence_texts))
    set_textrank(note_sections, note_context, section_texts, "note_rank")

    sentence_texts = [sent["text"] for sent in note_sentences]
    set_textrank(note_sentences, note_context, sentence_texts, "note_rank")

    return notes


def set_textrank(
    data: Union[List[Note], List[Section], List[Sentence]],
    context: str,
    texts: List[str],
    key: str,
):
    ranks = textrank(context, texts)
    for i, rank in enumerate(ranks):
        if data[i]["metadata"] is None:
            data[i]["metadata"] = {}

        data[i]["metadata"][key] = rank


def textrank(context: str, texts: List[str], phrase_limit=5):
    doc = nlp(context)
    text_vectors: list[tuple[str, set[int]]] = [(text, set()) for text in texts]

    unit_vector: List[float] = []
    phrase_id = 0
    for i, phrase in zip(range(phrase_limit), doc._.phrases):
        unit_vector.append(phrase.rank)

        for text, text_vector in text_vectors:
            if phrase.text in text:
                text_vector.add(phrase_id)

        phrase_id += 1

    sum_ranks = sum(unit_vector)
    unit_vector = [rank / sum_ranks for rank in unit_vector]

    text_rank: List[float] = []
    for text, text_vector in text_vectors:
        sum_sq = 0.0

        for phrase_id in range(len(unit_vector)):
            if phrase_id not in text_vector:
                sum_sq += unit_vector[phrase_id] ** 2.0

        text_rank.append(1 - sqrt(sum_sq))

    return text_rank
