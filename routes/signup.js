const express = require("express");
const router = express.Router();
const User = require("../schemas/user");

// 회원가입 API
router.post("/", async (req, res) => {
  const { nickname, password, confirm } = req.body;
  const regex = /[^a-zA-Z0-9]/g;
  try {
    if (!nickname || !password || !confirm) {
      return res.status(400).json({ errorMessage: "항목을 모두 적으세요" });
    }
    //? 체크 완료
    // 닉네임 형식이 비정상적인 경우
    if (nickname.length < 3 || nickname.search(regex) !== -1) {
      return res
        .status(412)
        .json({ errorMessage: "닉네임의 형식이 일치하지 않습니다." });
    }

    //? 체크완료
    //패스워드 형식이 비정상적인 경우
    if (password.length < 4) {
      return res
        .status(412)
        .json({ errorMessage: "패스워드 형식이 일치하지 않습니다." });
    }

    //? 체크 완료
    //  패스워드에 닉네임이 포함되어 있는지 여부
    if (nickname.includes(password)) {
      return res
        .status(412)
        .json({ errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });
    }

    if (password !== confirm) {
      //? 체크 완료
      // 패스워드 일치 확인
      return res
        .status(412)
        .json({ errorMessage: "패스워드가 일치하지 않습니다." });
    }

    //? 체크 완료
    // 닉네임 중복 확인
    const user = await User.findOne({ nickname });
    if (user)
      return res.status(412).json({ errorMessage: "중복된 닉네임입니다." });
  } catch (err) {
    console.error(err);
    // 예외 케이스에서 처리하지 못한 에러
    return res
      .status(400)
      .json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
  }
  //* 회원가입 성공
  if (!nickname || !password) {
    return res
      .status(400)
      .json({ errorMessage: "닉네임 또는 비밀번호를 입력하지 않았습니다" });
  }
  const user = new User({ nickname, password });
  await user.save();
  return res.status(201).json({ message: "회원 가입에 성공하였습니다." });
});

module.exports = router;
