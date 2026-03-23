function ok(res, data = null, message = "OK", status = 200) {
  return res.status(status).json({ success: true, message, data });
}
function fail(res, message = "요청 실패", status = 400) {
  return res.status(status).json({ success: false, message });
}
module.exports = { ok, fail };
