import string
import warnings
from gensim import corpora
from gensim import models

import numpy as np
import re
import pickle


class TopicModeling:
    def __init__(self, documents, num_topic_words=3, num_topics=1):
        self.documents = documents
        self.model = None
        self.num_topic_words = num_topic_words
        self.num_topics = num_topics
        self.topic_words = []

    def _build_model(self):
        self.model = models.ldamodel.LdaModel(
            self.corpus, num_topics=self.num_topics, id2word=self.dictionary, alpha="auto", eta="auto")

    def build_doc_term_mat(self):
        print("Building document-term matrix.")
        dictionary = corpora.Dictionary(self.documents)
        corpus = [dictionary.doc2bow(document) for document in self.documents]
        self.corpus, self.dictionary = corpus, dictionary

    def print_topic_words(self):
        self._build_model()
        print("\nPrinting topic words.\n")
        for topic_id in range(self.model.num_topics):
            topic_word_probs = self.model.show_topic(
                topic_id, self.num_topic_words)
            print("Topic ID: {}".format(topic_id))
            for topic_word, prob in topic_word_probs:
                print("\t{}\t{}".format(topic_word, prob))
            print("\n")

    def update_topic_words(self):
        self._build_model()
        for topic_id in range(self.model.num_topics):
            topic_word_probs = self.model.show_topic(
                topic_id, self.num_topic_words)
            for topic_word, prob in topic_word_probs:
                self.topic_words.append(topic_word)

    def get_topic_words(self):
        return self.topic_words
