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



app.listen(3000, function () {
  console.log("Example app listening at http://localhost:3000");
});