from src.libs.agent.types import Note, Section, Sentence


def extract_note_text(note: Note):
    text: list[str] = []

    for section in note["sections"]:
        for sentence in section["sentences"]:
            text.append(sentence["text"])

    return " ".join(text)


def extract_section_text(section: Section):
    text: list[str] = []

    for sentence in section["sentences"]:
        text.append(sentence["text"])

    return " ".join(text)


def extract_sentence_text(sentence: Sentence):
    return sentence["text"]
