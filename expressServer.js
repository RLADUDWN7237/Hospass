const express = require("express");
const app = express();
const request = require("request");
const jwt = require("jsonwebtoken");
const auth = require("./lib/auth");

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "",
  port: "",
  user: "",
  password: "",   //자기 비밀번호로
  database: "",
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

app.get("/diagnosis", function (req, res) {
	  res.render("diagnosis");
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
      client_id: "",   		//사용자 값으로 변경
      client_secret: "",     //사용자 값으로 변경
      redirect_uri: "http://115.85.180.54:3000/authResult",
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

app.get("/cancel", function (req, res) {
  res.render("cancel");
});

app.get("/account", function (req, res) {
  res.render("account");
});

app.get('/pay', function(req, res){
  res.render('pay');
});

app.get("/gocoder_qrcode", function (req, res) {
  res.render("gocoder_qrcode");
}); 

app.get("/receipt", function (req, res) {
  res.render("receipt");
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



app.post("/cancel", auth, function (req, res){
  var userId = req.decoded.userId;
  var fin_use_num = req.body.fin_use_num;
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "T991637220U" + countnum;    //사용자 입력

  console.log("유저 아이디, 핀테크번호 : ", userId, fin_use_num);
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [userId], function (err, results) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(("list 에서 조회한 개인 값 :", results));
      var option = {
        method: "POST",
        url: "https://testapi.openbanking.or.kr/v2.0/account/cancel",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
          "Content-Type": "application/json",
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        json: {
          bank_tran_id: transId,
          scope: "transfer",
          fintech_use_num: fin_use_num          
          },
      };
      request(option, function (error, response, body) {
        console.log(body);
        res.json(body);
      });
    }
  });
});

app.post('/pay',function(req,res){
  
  var userId = 1; //DB 레코드에 맞는 값 넣기
  var sql = "SELECT * FROM receipt WHERE user = ?";
  connection.query(sql,[userId], function(err, result){
      
      if(err) throw err;
      else{
          res.json(result);
      // var advise = result[0].userAdvise;
      // var paymentinfo = result[0].userPaymentInfo;
      // var payment = result[0].userPayment;
      // var prescription = result[0].userPrescription;
      
      }        
      
      console.log(result);
  })
})

app.post("/list", auth, function (req, res) {
  var userId = req.decoded.userId;
  var sql = "SELECT * FROM user WHERE id = ?"; 
  connection.query(sql, [userId], function (err, results) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(("list 에서 조회한 개인 값 :", results));
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/user/me",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        qs: {
          user_seq_no: results[0].userseqno,
          //#자기 키로 시크릿 변경
        },
      };
      request(option, function (error, response, body) {
        var listResult = JSON.parse(body);
        console.log(listResult);
        res.json(listResult);
      });
    }
  });
});
app.post("/list2", auth, function (req, res) {
  var userId = req.decoded.userId;
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [userId], function (err, results) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(("list 에서 조회한 개인 값 :", results));
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/user/me",
        headers: {
          Authorization: "Bearer " + '',//공동계좌 에세스토큰
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        qs: {
          user_seq_no: '', //공동계좌 시퀀스넘버 
          //#자기 키로 시크릿 변경
        },
      };
      request(option, function (error, response, body) {
        var listResult = JSON.parse(body);
        console.log(listResult);
        res.json(listResult);
      });
    }
  });
});


app.post("/gocoder_qrcode", function (req, res) {
  
   var userId = 1; //DB 레코드에 맞는 값 넣기
  var sql = "SELECT * FROM hospass_db.receipt WHERE user=?";
  connection.query(sql, function (error, results){
    if(error) console.log('query is not excuted. select fail...\n');
    else {
      console.log(results);
      res.json(results);
    } 
  })
});

app.post("/withdraw", auth, function (req, res) {
  var userId = req.decoded.userId;
  var amount = req.body.amount;

  var fin_use_num = req.body.fin_use_num;
  var to_fin_use_num = req.body.to_fin_use_num;
  console.log("유저 아이디, 출금할 핀테크번호, 입금할 핀테크번호 : ", userId, fin_use_num, to_fin_use_num, amount);

  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "" + countnum; //이용기관번호 본인것 입력
  var sql = "SELECT * FROM user WHERE id=?";
  
  connection.query(sql, [userId], function (err, results) {
    if (err) {
      console.error(err);
      throw err;
    } else {

      console.log(("list 에서 조회한 개인 값 :", results));
      console.log(results[0].payment)
      var a = results[0].payment;
      res.json(results);
      var option = {
        method: "POST",
        url: "https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
          "Content-Type": "application/json",
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        json: {
          bank_tran_id: transId,
          cntr_account_type: "N",
          cntr_account_num: "",  //사용자 입력
          dps_print_content: "쇼핑몰환불",
          fintech_use_num: fin_use_num,
          wd_print_content: "오픈뱅킹출금",
          tran_amt: a,
          tran_dtime: "20200721114000",
          req_client_name: "홍길동",
          req_client_fintech_use_num: fin_use_num,
          transfer_purpose: "ST",
          req_client_num: "",  //사용자 입력
          recv_client_name: "",  //사용자 입력
          recv_client_bank_code: "097",
          recv_client_account_num: "",  //사용자 입력
        },
      };

      
      /*request(option, function (error, response, body) {
        console.log(body);
        var countnum2 = Math.floor(Math.random() * 1000000000) + 1;
        var transId2 = "" + countnum2; //이용기과번호 본인것 입력
        
        var option = {
          method: "POST",
          url:
            "https://testapi.openbanking.or.kr/v2.0/transfer/deposit/fin_num",
          headers: {
            Authorization:
              "Bearer " +
              "",  //access_token 본인값 입력
            "Content-Type": "application/json",
          },
          //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
          json: {
            cntr_account_type: "N",
            cntr_account_num: "",  //사용자 입력
            wd_pass_phrase: "NONE",
            wd_print_content: "환불금액",
            name_check_option: "on",
            tran_dtime: "20200721114000",
            req_cnt: "1",
            req_list: [
              {
                tran_no: "1",
                bank_tran_id: transId2,
                fintech_use_num: to_fin_use_num,
                print_content: "쇼핑몰환불",
                tran_amt: amount,
                req_client_name: "홍길동",
                req_client_fintech_use_num: "",   //사용자 입력
                req_client_num: "HONGGILDONG1234",
                transfer_purpose: "ST",
              },
            ],
          },
        };
        
      });*/

      request(option, function (error, response, body) {
        console.log(body);
      });

    }
  });
});

app.post('/diagnosis', function(req, res){
	  var userAdvise = req.body.userAdvise;
	//  console.log(userAdvise)
	  var sql = "UPDATE receipt SET advise=? WHERE user = '1'"
	  connection.query(sql,[userAdvise], function (error, results, fields) {
		        if (error) throw error;
		        res.json('저장완료');
		    });
})

app.post('/receipt',function(req,res){
	  
	  var userId = 1;
	  var sql = "SELECT * FROM hospass_db.receipt WHERE user = ?";
	  connection.query(sql,[userId], function(err, result){
		        
		        if(err) throw err;
		        else{
				          res.json(result);
				      }        
		        console.log(result);
		    })
})

app.post('/reservation', function(req, res){
	  console.log("지상잉");
	  var userSymptom = req.body.userSymptom;
	  console.log(userSymptom)
          var sql = "UPDATE receipt SET symptom=? WHERE user = '1'"
          connection.query(sql,[userSymptom], function (error, results, fields) {
          if (error) throw error;
          res.json('저장완료');
          });
          })

app.listen(3000, function () {
  console.log("Example app listening at http://localhost:3000");
});
