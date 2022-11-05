import spacy
import pytextrank

nlp = spacy.load("en_core_web_md")
stopwords = nlp.Defaults.stop_words

excluded_stopwords = {}
for word in stopwords:
    excluded_stopwords[word] = ["NP"]

nlp.add_pipe("textrank", last=True, config={"stopwords": excluded_stopwords})
