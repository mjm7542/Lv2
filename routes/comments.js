const express = require("express");
const router = express.Router();
const Comments = require("../schemas/comments");
const authMiddleware = require("../middlewares/auth-middlewares");
const Posts = require("../schemas/posts");

//? 댓글 조회
router.get("/:_postId/comments", async (req, res) => {
  try {
    const { _postId } = req.params;
    //! 게시물 못 찾을 때 에러(24자리 고정) 
    const posts = await Posts.findById({ _id: _postId }).exec()
    if (!posts) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    const comments = await Comments.find({}).sort({ createdAt: -1 }).exec();
    const new_comments = comments.map((comment) => {
      return {
        commentId: comment["_id"],
        userId: comment["userId"],
        nickname: comment["nickname"],
        comment: comment["comment"],
        createdAt: comment["createdAt"],
        updatedAt: comment["updatedAt"],
      };
    });

    res.status(200).json({ comments: new_comments });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ errorMessage: "댓글 조회에 실패하였습니다." });
  }
});

//? 댓글 생성
router.post("/:_postId/comments", authMiddleware, async (req, res) => {
  try {
    const { _postId } = req.params;
    const { userId, nickname } = res.locals.user;
    //! body에 문제가 있을 때
    const { comment } = req.body; // POST로 넘어온다. body 객체 참조할 것.
    if (!comment)
      return res
        .status(412)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    //! 게시물 못 찾을 때 에러(24자리 고정) 
    const posts = await Posts.findById({ _id: _postId }).exec()
    if (!posts) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    await Comments.create({ userId, nickname, comment });
    return res.status(201).json({ message: "댓글을 작성하였습니다." });
  } catch (err) {
    console.error(err)
    return res
      .status(400)
      .json({ errorMessage: "댓글 작성에 실패하였습니다." });
  }
});

//? 댓글 수정
router.put("/:_postId/comments/:_commentId", authMiddleware, async (req, res) => {
  try {
    const { _postId, _commentId } = req.params;
    const { comment } = req.body;
    const { nickname } = res.locals.user;
    //! body에 문제가 있을 때
    if (!comment) {
      return res
        .status(412)
        .json({ errorMessage: "댓글 작성에 실패하였습니다." })
    }
    //! 게시물 못 찾을 때 에러(24자리 고정) 
    const posts = await Posts.findById({ _id: _postId }).exec();
    if (!posts) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    //! 댓글을 못 찾을 때 에러(24자리 고정) 
    const [comments] = await Comments.find({ _id: _commentId }).exec();
    if (!comments) {
      return res
        .status(404)
        .json({ errorMessage: "댓글이 존재하지 않습니다." });
    }
    //! 권한이 없을 때 (토큰의 닉네임 활용)
    if (comments.nickname !== nickname) {
      return res
        .status(403)
        .json({ errorMessage: "댓글의 수정 권한이 존재하지 않습니다." });
    }

    const updateComment = await Comments.updateOne(
      { _id: _commentId },
      { $set: { comment } }
    );

    //! acknowledged 정상적 처리 확인 
    if (updateComment.acknowledged) {
      return res.status(200).json({ message: "댓글을 수정하였습니다" }); // 상태코드 수정 201 -> 204
    } else {
      return res
        .status(400)
        .json({ errorMessage: "댓글 수정이 정상적으로 처리되지 않았습니다." });
    }

  } catch (err) {
    console.error(err)
    res
      .status(204)
      .json({ errorMessage: "댓글 수정에 실패하였습니다." });
  }
});

//? 댓글 삭제
router.delete("/:_postId/comments/:_commentId", authMiddleware, async (req, res) => {

  try {
    const { _postId, _commentId } = req.params;
    const { nickname } = res.locals.user;
    //! 게시물 못 찾을 때 에러(24자리 고정) 
    const posts = await Posts.findById({ _id: _postId }).exec()
    console.log("posts:", posts)
    if (!posts) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    //! 댓글을 못 찾을 때 에러(24자리 고정)
    const [comments] = await Comments.find({ _id: _commentId }).exec();
    console.log("comments:", comments)
    if (!comments) {
      return res
        .status(404)
        .json({ errorMessage: "댓글이 존재하지 않습니다." });
    }
    //! 권한이 없을 때 (토큰의 닉네임 활용)
    if (comments.nickname !== nickname) {
      return res
        .status(403)
        .json({ errorMessage: "댓글의 삭제 권한이 존재하지 않습니다." });
    }
    //! acknowledged 정상적 처리 확인 
    const deleteComments = await Comments.deleteOne({ _id: _commentId });
    if (deleteComments.acknowledged) {
      return res
        .status(200)
        .json({ message: "댓글을 삭제하였습니다" });
    } else {
      return res
        .status(400)
        .json({ errorMessage: "댓글 삭제가 정상적으로 처리되지 않았습니다." });
    }
  } catch (err) {
    console.error(err)
    res
      .status(400)
      .json({ errorMessage: "댓글 삭제에 실패하였습니다." });
  }
});

module.exports = router;
