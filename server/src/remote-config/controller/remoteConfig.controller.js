const svc = require("../service/remoteConfig.service");
const { ok, fail } = require("../../utils/response");

module.exports = {
  async getActive(req, res, next) { try { return ok(res, await svc.getActive()); } catch (e) { next(e); } },
  async listAll(req, res, next) { try { return ok(res, await svc.listAll()); } catch (e) { next(e); } },
  async create(req, res, next) {
    try {
      if (!req.body.key) return fail(res, "key 필수");
      return ok(res, await svc.create(req.body), "생성됨", 201);
    } catch (e) { next(e); }
  },
  async update(req, res, next) {
    try { return ok(res, await svc.update(req.params.id, req.body)); } catch (e) { next(e); }
  },
  async remove(req, res, next) {
    try { await svc.remove(req.params.id); return ok(res, null, "삭제됨"); } catch (e) { next(e); }
  },
};
