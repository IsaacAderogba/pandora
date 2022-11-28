import spacy
from spacy.tokens import DocBin
import re
import pytextrank

nlp = spacy.load("en_core_web_md")
stopwords = nlp.Defaults.stop_words

excluded_stopwords = {}
for word in stopwords:
    excluded_stopwords[word] = ["NP"]

nlp.add_pipe("textrank", last=True, config={"stopwords": excluded_stopwords})

def create_cleaned_doc(text: str):
    sentence = []

    for term in text.split():
        term = re.sub("[^a-zA-Z]", " ", term.lower())
        sentence.append(term)

    sentence = [word.strip() for word in sentence if word.strip() not in stopwords]
    return nlp(" ".join(sentence).strip())