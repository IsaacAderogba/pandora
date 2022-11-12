from src.libs.agent.types import Note


def extract_note_text(note: Note):
    text: list[str] = []

    for section in note["sections"]:
        for sentence in section["sentences"]:
            text.append(sentence["text"])

    return " ".join(text)
