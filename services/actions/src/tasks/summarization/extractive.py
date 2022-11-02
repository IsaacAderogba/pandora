from src.tasks.ranking.textrank import rank_documents
from src.libs.agent.types import Document, Sentence


def extract_rank_cutoff(document: Document, limit: int) -> float:
    assert limit > 0

    sentences: list[tuple[int, Sentence]] = []
    for section in document["sections"]:
        for sentence in section["sentences"]:
            sentences.append((sentence["metadata"]["section_rank"], sentence))

    if len(sentences) < limit:
        return 0

    sorted_sentences = sorted(sentences, key=lambda x: x[0], reverse=True)
    return sorted_sentences[limit - 1][0]


def summarize_documents_extractively(
    documents: list[Document], limit: int
) -> list[Document]:
    summarized_documents: list[Document] = []

    for ranked_document in rank_documents(documents):
        document: Document = {
            "id": ranked_document["id"],
            "metadata": ranked_document["metadata"],
            "sections": [],
        }

        count = 0
        cutoff = extract_rank_cutoff(ranked_document, limit)
        for ranked_section in ranked_document["sections"]:
            sentences: list[Sentence] = []

            for sentence in ranked_section["sentences"]:
                if count >= limit:
                    break

                if sentence["metadata"]["section_rank"] >= cutoff:
                    sentences.append(sentence)
                    count += 1

            if len(sentences) > 0:
                document["sections"].append({**ranked_section, "sentences": sentences})

        summarized_documents.append(document)

    return summarized_documents
