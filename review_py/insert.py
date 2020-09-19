import pymysql


class Insert:
    def __init__(self, user, pwd, host, db_name, doctor, charset, keywords):  # keywords = 리스트로 전달
        self.user = user
        self.pwd = pwd
        self.host = host
        self.db_name = db_name
        self.doctor = doctor
        self.charset = charset
        self.keywords = keywords

    def connect(self):
        self.db = pymysql.connect(  # dtype == char
            user=self.user,
            passwd=self.pwd,
            host=self.host,
            db=self.db_name,
            charset=self.charset
        )
        self.cursor = self.db.cursor(pymysql.cursors.DictCursor)

    def insert(self):
        key = ""
        for keyword in self.keywords:
            key += keyword
            key += ' '
        sql = "UPDATE hospass_db.doctor SET keyword=%s WHERE id=%s"
        self.cursor.execute(sql, (key, self.doctor))
        self.db.commit()

    def call(self):
        self.connect()
        self.insert()
        self.db.close()

# update hospass_db.reveiw SET keyword={} WHERE doctor={}
