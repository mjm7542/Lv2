const mongoose = require("mongoose");
// const Posts = require("./posts");

const commentsSchema = new mongoose.Schema(
  {
    _postId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
  { versionKey: false }
);

module.exports = mongoose.model("Comments", commentsSchema); // 컬렉션명 : Comments

// userId, nickname, updatedAt / password 제거 