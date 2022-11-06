from src.tasks.ranking.textrank import rank_notes
from src.libs.agent.types import Note, Sentence


def extract_rank_cutoff(note: Note, limit: int) -> float:
    assert limit > 0

    sentences: list[tuple[int, Sentence]] = []
    for section in note["sections"]:
        for sentence in section["sentences"]:
            sentences.append((sentence["metadata"]["section_rank"], sentence))

    if len(sentences) < limit:
        return 0

    sorted_sentences = sorted(sentences, key=lambda x: x[0], reverse=True)
    return sorted_sentences[limit - 1][0]


def summarize_notes_extractively(
    notes: list[Note], limit: int
) -> list[Note]:
    summarized_notes: list[Note] = []

    for ranked_note in rank_notes(notes):
        note: Note = {
            "id": ranked_note["id"],
            "metadata": ranked_note["metadata"],
            "sections": [],
        }

        count = 0
        cutoff = extract_rank_cutoff(ranked_note, limit)
        for ranked_section in ranked_note["sections"]:
            sentences: list[Sentence] = []

            for sentence in ranked_section["sentences"]:
                if count >= limit:
                    break

                if sentence["metadata"]["section_rank"] >= cutoff:
                    sentences.append(sentence)
                    count += 1

            if len(sentences) > 0:
                note["sections"].append({**ranked_section, "sentences": sentences})

        summarized_notes.append(note)

    return summarized_notes
