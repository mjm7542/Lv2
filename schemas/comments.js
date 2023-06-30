const mongoose = require("mongoose");
// const Posts = require("./posts");

const commentsSchema = new mongoose.Schema(
  {
    _postId: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Comments", commentsSchema); // 컬렉션명 : Comments
