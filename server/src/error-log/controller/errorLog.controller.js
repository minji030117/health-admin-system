const svc = require("../service/errorLog.service");
const { ok, fail } = require("../../utils/response");

module.exports = {
  async create(req, res, next) {
    try {
      if (!req.body.message) return fail(res, "message 필수");
      return ok(res, await svc.create(req.body), "저장됨", 201);
    } catch (e) { next(e); }
  },
  async batch(req, res, next) {
    try {
      const { logs } = req.body;
      if (!Array.isArray(logs) || !logs.length) return fail(res, "logs 배열 필수");
      return ok(res, await svc.createBatch(logs), `${logs.length}건 저장`, 201);
    } catch (e) { next(e); }
  },
  async list(req, res, next) {
    try {
      const { level, platform, page, limit } = req.query;
      return ok(res, await svc.list({ level, platform, page: +page || 1, limit: +limit || 50 }));
    } catch (e) { next(e); }
  },
  async stats(req, res, next) {
    try { return ok(res, await svc.stats()); } catch (e) { next(e); }
  },
};
