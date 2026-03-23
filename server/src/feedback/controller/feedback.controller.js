const svc = require("../service/feedback.service");
const { ok, fail } = require("../../utils/response");

module.exports = {
  async create(req, res, next) {
    try {
      const { userId, category, title, content } = req.body;
      if (!userId || !title || !content) return fail(res, "userId, title, content 필수");
      return ok(res, await svc.create({ userId, category, title, content }), "접수됨", 201);
    } catch (e) { next(e); }
  },
  async list(req, res, next) {
    try {
      const { status, page, limit } = req.query;
      return ok(res, await svc.list({ status, page: +page || 1, limit: +limit || 20 }));
    } catch (e) { next(e); }
  },
  async get(req, res, next) {
    try {
      const fb = await svc.getById(req.params.id);
      return fb ? ok(res, fb) : fail(res, "피드백 없음", 404);
    } catch (e) { next(e); }
  },
  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!["pending", "in_review", "resolved", "rejected"].includes(status)) return fail(res, "유효하지 않은 상태");
      return ok(res, await svc.updateStatus(req.params.id, status));
    } catch (e) { next(e); }
  },
  async reply(req, res, next) {
    try {
      const { content } = req.body;
      if (!content) return fail(res, "답변 내용 필수");
      return ok(res, await svc.addReply({ feedbackId: req.params.id, adminId: req.admin.id, content }), "답변 등록", 201);
    } catch (e) { next(e); }
  },
  async listByUser(req, res, next) {
    try { return ok(res, await svc.listByUser(req.params.userId)); } catch (e) { next(e); }
  },
};
