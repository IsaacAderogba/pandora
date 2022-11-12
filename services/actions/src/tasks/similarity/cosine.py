import re
from src.libs.spacy.nlp import stopwords, nlp
from src.libs.agent.types import Note
from src.utils.text import extract_note_text


def create_doc(text: str):
    sentence = []

    for term in text.split():
        term = re.sub("[^a-zA-Z]", " ", term.lower())
        sentence.append(term)

    sentence = [word.strip() for word in sentence if word.strip() not in stopwords]
    return nlp(" ".join(sentence).strip())


def cosine_similar_notes(target: Note, notes: list[Note]):
    target_doc = create_doc(extract_note_text(target))

    for note in notes:
        doc = create_doc(extract_note_text(note))

        if note["metadata"] is None:
            note["metadata"] = {}

        note["metadata"]["similarity_cosine"] = target_doc.similarity(doc)

    return notes
