const express = require("express");
const router = express.Router();
const Posts = require("../schemas/posts");
const authMiddleware = require("../middlewares/auth-middlewares.js");

//게시글 전체 조회
router.get("/", async (req, res) => {
  try {
    const posts = await Posts.find({}).sort({ updatedAt: -1 }).exec();
    const new_posts = posts.map((post) => {
      return {
        postId: post["_id"],
        userId: post["userId"],
        nickname: post["nickname"],
        title: post["title"],
        content: post["content"],
        createdAt: post["createdAt"],
        updatedAt: post["updatedAt"],
      };
    });

    return res.status(200).json({ posts: new_posts });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// 게시글 상세 조회
router.get("/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    const posts = await Posts.findOne({ _id: _postId }).exec();

    const new_posts = {
      postId: posts["_id"],
      userId: posts["userId"],
      nickname: posts["nickname"],
      title: posts["title"],
      content: posts["content"],
      createdAt: posts["createdAt"],
      updatedAt: posts["updatedAt"],
    };

    return res.status(200).json({ post: new_posts });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// 게시글 작성
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { _id: userId, nickname } = res.locals.user;
    const { title, content } = req.body;

    //! body 데이터가 정상적으로 전달되지 않은 경우
    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    }

    //! title의 형식이 비정상적인 경우
    if (!title || title.length > 25) {
      return res
        .status(412)
        .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    }
    //! content의 형식이 비정상적인 경우
    if (!content || content.length > 1000) {
      return res
        .status(412)
        .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    }

    await Posts.create({ userId, nickname, title, content });
    return res.status(201).json({ message: "게시글 작성에 성공하였습니다" });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ errorMessage: "게시글 작성에 실패하였습니다." });
  }
});

// 게시글 수정
router.put("/:_postId", authMiddleware, async (req, res) => {
  try {
    const { _id: userId } = res.locals.user;
    const { _postId } = req.params;
    const { title, content } = req.body;

    //! body 데이터가 정상적으로 전달되지 않은 경우
    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    }

    //! title의 형식이 비정상적인 경우
    if (!title || title.length > 25) {
      return res
        .status(412)
        .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    }
    //! content의 형식이 비정상적인 경우
    if (!content || content.length > 1000) {
      return res
        .status(412)
        .status(412)
        .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    }

    //* 현재 param에 해당하는 게시글 가져오기
    const posts = await Posts.findOne({ _id: _postId }).exec();

    //! 403 게시글을 수정할 권한이 존재하지 않는 경우
    if (userId !== posts.userId) {
      // 현재 로그인된 유저의 아이디와 게시글의 아이디가 불일치 할 경우 수정 권한 없음
      return res
        .status(403)
        .json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });
    }

    await Posts.updateOne(
      { _id: _postId },
      { $set: { title, content } }
    ).exec();

    //! 401 게시글 수정이 실패한 경우
    if (!posts) {
      return res
        .status(401)
        .json({ errorMessage: "게시글이 정상적으로 수정되지 않았습니다." });
    }
    return res.status(201).json({ message: "게시글을 수정하였습니다." });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ errorMessage: "게시글 수정에 실패하였습니다." });
  }
});

// 게시글 삭제
router.delete("/:_postId", authMiddleware, async (req, res) => {
  try {
    const { _id: userId } = res.locals.user;
    const { _postId } = req.params;

    if (!_postId)
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다." });

    const posts = await Posts.findOne({ _id: _postId }).exec();

    //! 404 게시글이 존재하지 않는 경우
    if (!posts.length) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }

    //! 403 게시글을 삭제할 권한이 존재하지 않는 경우
    if (userId !== posts.userId) {
      // 현재 로그인된 유저의 아이디와 게시글의 아이디가 불일치 할 경우 수정 권한 없음
      return res
        .status(403)
        .json({ errorMessage: "게시글의 삭제 권한이 존재하지 않습니다." });
    }
    await Posts.deleteOne({ _id: _postId });

    //! 게시글 삭제에 실패한 경우
    const checkPostDelete = await Posts.findOne({ _id: _postId }).exec();
    if (checkPostDelete) {
      return res
        .status(401)
        .json({ errorMessage: "게시글이 정상적으로 삭제되지 않았습니다." });
    }

    return res.status(204).json({ message: "게시글을 삭제하였습니다" });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ errorMessage: "게시글 작성에 실패하였습니다." });
  }
});

module.exports = router;
