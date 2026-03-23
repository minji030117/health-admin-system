const jwt = require("jsonwebtoken");
const { fail } = require("../utils/response");

function adminAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return fail(res, "인증 필요", 401);
  try {
    req.admin = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch { return fail(res, "토큰 만료/무효", 401); }
}
module.exports = { adminAuth };
