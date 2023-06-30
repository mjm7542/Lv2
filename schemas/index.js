const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connect = () => {
  mongoose
    .connect(process.env.MONGOOSE, {
      dbName: "Lv1",
    })
    .catch((err) => console.error(err));
};

mongoose.connection.on("error", (err) =>
  console.error("몽고 디비 연결 에러", err)
);

module.exports = connect;
