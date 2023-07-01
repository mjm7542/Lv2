const express = require("express");
const app = express();
const indexRouter = require("./routes/index");
const cookieParser = require("cookie-parser");

const connect = require("./schemas");
connect();

const dotenv = require("dotenv");
dotenv.config();

app.use(express.json()); 
app.use(cookieParser());
app.use("/", indexRouter);

app.listen(process.env.PORT || 3000, (req, res) => {
  console.log(`${process.env.PORT || 3000} 포트에 접속 되었습니다.`);
});
