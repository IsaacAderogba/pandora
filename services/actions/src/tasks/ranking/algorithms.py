from math import sqrt
from typing import List
from src.libs.spacy.nlp import nlp

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
