const express = require("express");
const app = express();
const request = require("request");
const jwt = require("jsonwebtoken");
const auth = require("./lib/auth");

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",   //자기 비밀번호로
  database: "fintech2",
});

connection.connect();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/public"));


app.get("/main", function (req, res) {
  res.render("main");
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get('/authResult', function (req, res) {
  var authCode = req.query.code;
  console.log("인증코드 : ", authCode);
  
  var option = {
    method: "POST",
    url: "https://testapi.openbanking.or.kr/oauth/2.0/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    form: {
      code: authCode,
      client_id: "",   //사용자 값으로 변경
      client_secret: "",     //사용자 값으로 변경
      redirect_uri: "http://localhost:3000/authResult",
      grant_type: "authorization_code"
    }, 
  };

  request(option, function (error, response, body){
    var accessRequestResult = JSON.parse(body);
    console.log(accessRequestResult);
    res.render("resultChild", {data: accessRequestResult});
  });
});

app.get("/authTest", auth, function (req, res) {
  res.json("환영합니다 우리 고객님");
});

app.get("/main_2", function (req, res) {
  res.render('main_2');
});

app.get("/logo", function (req, res) {
  res.render("logo");
});

app.get("/reservation", function (req, res) {
  res.render('reservation');
});

app.post("/login", function (req, res) {
  console.log("사용자 입력정보 :", req.body);
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var sql = "SELECT * FROM user WHERE email = ?";
  connection.query(sql, [userEmail], function (error, results, fields) {
    if (error) throw error;
    else {
      if (results.length == 0) {
        res.json("등록되지 않은 아이디 입니다.");
      } else {
        var dbPassword = results[0].password;
        if (userPassword == dbPassword) {
          var tokenKey = "fintech";
          jwt.sign(
            {
              userId: results[0].id,
              userEmail: results[0].email,
            },
            tokenKey,
            {
              expiresIn: "10d",
              issuer: "fintech.admin",
              subject: "user.login.info",
            },
            function (err, token) {
              console.log("로그인 성공", token);
              res.json(token);
            }
          );
        } else {
          res.json("비밀번호가 다릅니다!");
        }
      }
    }
  });
});

app.post("/signup", function (req, res) {
  console.log(req.body);
  var userName = req.body.userName;
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var userAccessToken = req.body.userAccessToken;
  var userRefreshToken = req.body.userRefreshToken;
  var userSeqNo = req.body.userSeqNo;

  var sql =
    "INSERT INTO `user` (`name`, `email`, `password`, `accesstoken`, `refreshtoken`, `userseqno`) VALUES (?, ?, ?, ?, ?, ?)";
 
  connection.query(
    sql,
    [
      userName,
      userEmail,
      userPassword,
      userAccessToken,
      userRefreshToken,
      userSeqNo,
    ],
    function (error, results, fields) {
      if (error) throw error;
      else {
        console.log("sql :", this.sql);
        res.json(1);
      }
    }
  );
});



app.listen(3000, function () {
  console.log("Example app listening at http://localhost:3000");
});
