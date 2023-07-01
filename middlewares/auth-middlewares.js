const jwt = require("jsonwebtoken");
const User = require("../schemas/users");

// 사용자 인증 미들웨어
module.exports = async (req, res, next) => {
  const { authorization } = req.cookies;
  const [loginType, loginToken] = (authorization ?? "").split(" ");

  if (!loginToken || loginType !== "Bearer") {
    res.status(402).json({
      errorMessage: "로그인이 필요한 기능입니다.",
    });
    return;
  }

  try {
    const { userId } = jwt.verify(loginToken, "customized-secret-key");
    const user = await User.findById(userId);
    res.locals.user = user;
    next();
  } catch (error) {
    res.status(403).send({
      errorMessage: "전달된 쿠키에서 오류가 발생하였습니다.",
    });
  }
};
