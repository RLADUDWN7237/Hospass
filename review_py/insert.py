import pymysql


class Insert:
    def __init__(self, user, pwd, host, db_name, doctor, keywords):  # keywords = 리스트로 전달
        self.user = user
        self.pwd = pwd
        self.host = host
        self.db_name = db
        self.doctor = doctor
        self.keywords = keywords

    def connect(self):
        self.db = pymysql.connect(  # dtype == char
            user=self.user,
            passwd=self.pwd,
            host=self.host,
            db=self.db_name
        )
        self.cursor = self.db.cursor(pymysql.cursors.DictCursor)

    def insert(self):
        key = ""
        for keyword in self.keywords:
            key += keyword
            key += " "
        sql = "UPDATE hospass_db.reveiw SET keyword={} WHERE doctor={}".format(
            key, self.doctor)
        self.cursor.execute(sql)
        self.db.commit()

    def call(self):
        self.connect()
        self.insert()
        self.db.close()

# update hospass_db.reveiw SET keyword={} WHERE doctor={}
