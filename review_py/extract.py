import pymysql


class Extract:
    def __init__(self, user, pwd, host, db_name, doctor):
        self.user = user
        self.pwd = pwd
        self.host = host
        self.db_name = db
        self.doctor = doctor

    def connect(self):
        self.db = pymysql.connect(  # dtype == char
            user=self.user,
            passwd=self.pwd,
            host=self.host,
            db=self.db_name
        )
        self.cursor = self.db.cursor(pymysql.cursors.DictCursor)

    def fetch(self):
        sql = "SELECT review FROM hospass_db.review R, hospass_db.doctor D WHERE R.doctor = D.id and D.id = {}".format(
            self.doctor)
        self.cursor.execute(sql)
        self.reviews = self.cursor.fetchall()

    def _chToTxt(self):
        self.result = []
        for review in self.reviews:
            self.result.append(review['review'])

    def saveAsTxt(self):
        with open("review.pk", "wb", encoding='utf-8') as f:
            for review in result:
                review.write(review + '\n')

    def get_reviews(self):
        return self.reviews

    def call(self):
        # 한큐에 실행
        self.connect()
        self.fetch()
        self._chToTxt()
        self.saveAsTxt()
        self.db.close()

# [{'id': 4, 'review': '좋아요', 'doctor': 1, 'D.id': 1, 'name': 'heo', 'keyword': None},
# {'id': 5, 'review': '좋아요', 'doctor': 1, 'D.id': 1, 'name': 'heo', 'keyword': None},
# {'id': 6, 'review': '개같아요', 'doctor': 1, 'D.id': 1, 'name': 'heo', 'keyword': None}]
#conn = pymysql.connect(user='hospass_db',pwd='hospass123!@',host='db-4s3h9.cdb.ntruss.com',db='hospass_db')
