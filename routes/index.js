const express = require("express");
const router = express.Router();
const comments = require("./comments");
const posts = require("./posts");
const signup = require("./signup");
const login = require("./login");


router.use("/signup", signup)
router.use("/login", login)
router.use("/posts", posts, comments);

// router.use("/posts/:_postId/comments", comments);

module.exports = router;
