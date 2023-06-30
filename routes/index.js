const express = require("express");
const router = express.Router();
const comments = require("./comments");
const posts = require("./posts");

router.use("/posts", posts, comments);

// router.use("/posts/:_postId/comments", comments);

module.exports = router;
