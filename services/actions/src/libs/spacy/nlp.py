import spacy

nlp = spacy.load("en_core_web_md")
stopwords = nlp.Defaults.stop_words