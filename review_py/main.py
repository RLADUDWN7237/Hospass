from TopicModeling import TopicModeling
from Preprocessing import Preprocessing
import sys
from extract import Extract
from insert import Insert

if __name__ == "__main__":
    extract = Extract(user='hospass_db', pwd='hospass123!@',
                      host='db-4s3h9.cdb.ntruss.com', db_name='hospass_db', doctor=sys.argv[1])
    extract.call()
    extracted = extract.get_reviews()
    #print(extract.result)
    text = Preprocessing('review.pk', 'data/stopwords.txt')
    text.text_tokenizing('noun')
    tokenized = text.tokenized_corpus
   # print(text.stopwords)
    #print(text.doc)
    #print(tokenized)
    tm = TopicModeling(tokenized)
    tm.build_doc_term_mat()
    tm.update_topic_words()
    topics = tm.get_topic_words()

    insert = Insert(user='hospass_db', pwd='hospass123!@', host='db-4s3h9.cdb.ntruss.com',
                    db_name='hospass_db', doctor=sys.argv[1], keywords=topics)
    insert.call()
