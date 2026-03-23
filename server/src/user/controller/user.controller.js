const svc = require("../service/user.service");
const { ok, fail } = require("../../utils/response");

module.exports = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return fail(res, "email, password 필수");
      return ok(res, await svc.login(email, password), "로그인 성공");
    } catch (e) { next(e); }
  },
  async sync(req, res, next) {
    try {
      const { deviceId } = req.body;
      if (!deviceId) return fail(res, "deviceId 필수");
      return ok(res, await svc.syncAppUser(req.body));
    } catch (e) { next(e); }
  },
  async list(req, res, next) {
    try {
      const { plan, page, limit } = req.query;
      return ok(res, await svc.listAppUsers({ plan, page: +page || 1, limit: +limit || 30 }));
    } catch (e) { next(e); }
  },
  async get(req, res, next) {
    try {
      const u = await svc.getAppUser(req.params.id);
      return u ? ok(res, u) : fail(res, "사용자 없음", 404);
    } catch (e) { next(e); }
  },
  async adjustPoints(req, res, next) {
    try {
      const { amount } = req.body;
      if (typeof amount !== "number") return fail(res, "amount(숫자) 필수");
      return ok(res, await svc.adjustPoints(req.params.id, amount));
    } catch (e) { next(e); }
  },
  async dashboard(req, res, next) {
    try { return ok(res, await svc.dashboard()); } catch (e) { next(e); }
  },
};
