from gensim import models
from konlpy.tag import Mecab
import numpy as np
import re
import pickle
import string
mecab = Mecab()


class Preprocessing:
    def __init__(self, txtFile, stwFile):
        self.txtfile = txtFile
        self.stwFile = stwFile
        self.doc = self._read_documents()
        self.stopwords = self._define_stopwords()

    def _read_documents(self):

        corpus = []
        with open(self.txtfile, 'rb') as f:
            temp_corpus = pickle.load(f)
        for page in temp_corpus:
            corpus.append(page['review'])

        return corpus

    def _define_stopwords(self):

        SW = set()
        for i in string.punctuation:
            SW.add(i)
        with open(self.stwFile, 'rt', encoding='utf8') as f:
            for word in f:
                word = word.rstrip('\n')
                SW.add(word)

        return SW

    def text_cleaning(self):
        cleaned_docs = []
        for text in self.doc:
            temp_doc = re.sub("[^ㄱ-ㅎㅏ-ㅣ가-힣 ]", "", text)
            cleaned_docs.append(text)

        self.corpus = cleaned_docs

    def text_tokenizing(self, tokenizer):
        self.text_cleaning()
        token_corpus = []
        if tokenizer == 'noun':
            for n in range(len(self.corpus)):
                token_text = mecab.nouns(self.corpus[n])
                token_text = [
                    word for word in token_text if word not in self.stopwords and len(word) > 1]
                token_corpus.append(token_text)
        elif tokenizer == 'morph':
            for n in range(len(self.corpus)):
                token_text = mecab.morphs(self.corpus[n])
                token_text = [
                    word for word in token_text if word not in self.stopwords and len(word) > 1]
                token_corpus.append(token_text)

        elif tokenizer == 'word':
            for n in range(len(self.corpus)):
                token_text = self.corpus[n].split()
                token_text = [
                    word for word in token_text if word not in self.stopwords and len(word) > 1]
                token_corpus.append(token_text)

        self.tokenized_corpus = token_corpus
