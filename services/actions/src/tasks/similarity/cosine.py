import re
from typing import Union
from src.libs.spacy.nlp import create_cleaned_doc
from src.libs.agent.types import Note, Section, Sentence
from src.utils.text import extract_note_text, extract_section_text, extract_sentence_text


def cosine_similar_notes(text: str, notes: list[Note]):
    target_doc = create_cleaned_doc(text)

    for note in notes:
        doc = create_cleaned_doc(extract_note_text(note))
        set_cosine_similarity(note, target_doc.similarity(doc))

        for section in note["sections"]:
          doc = create_cleaned_doc(extract_section_text(section))
          set_cosine_similarity(section, target_doc.similarity(doc))

          for sentence in section["sentences"]:
            doc = create_cleaned_doc(extract_sentence_text(sentence))
            set_cosine_similarity(sentence, target_doc.similarity(doc))

    return notes


def set_cosine_similarity(
    candidate: Union[Note, Section, Sentence],
    score: float,
):
    if candidate["metadata"] is None:
        candidate["metadata"] = {}

    candidate["metadata"]["similarity_cosine"] = score
