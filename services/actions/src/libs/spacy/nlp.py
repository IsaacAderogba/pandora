import spacy
import pytextrank

nlp = spacy.load("en_core_web_md")
nlp.add_pipe("textrank", last=True)

stopwords = nlp.Defaults.stop_words