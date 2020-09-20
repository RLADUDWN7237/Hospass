from TopicModeling import TopicModeling
from Preprocessing import Preprocessing
import sys
from extract import Extract
from insert import Insert
import os
if __name__ == "__main__":
    # print(sys.argv[0])
    extract = Extract(user=, pwd=,
                      host=, db_name=, doctor=, charset='utf8')
    extract.call()
    extracted = extract.get_reviews()

    
    #print(extract.result)
    text = Preprocessing('review.pk', '/root/hospass/Hospass/review_py/data/stopwords.txt')



    text.text_tokenizing('noun')
    tokenized = text.tokenized_corpus
    # print(text.stopwords)
    # print(text.doc)
    # print(tokenized)
    tm = TopicModeling(tokenized)
    tm.build_doc_term_mat()
    tm.update_topic_words()
    topics = tm.get_topic_words()
    print(topics)
    insert = Insert(user=, pwd=, host=,
                    db_name=, doctor=, charset='utf8', keywords=topics)
    insert.call()
