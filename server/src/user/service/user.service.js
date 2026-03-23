const prisma = require("../../utils/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  async login(email, password) {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await bcrypt.compare(password, admin.password)))
      throw Object.assign(new Error("이메일 또는 비밀번호 오류"), { status: 401 });
    const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "12h" });
    return { token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } };
  },

  async syncAppUser({ deviceId, nickname, plan }) {
    return prisma.appUser.upsert({
      where: { deviceId },
      update: { nickname, plan, lastActiveAt: new Date() },
      create: { deviceId, nickname, plan, lastActiveAt: new Date() },
    });
  },

  async listAppUsers({ plan, page = 1, limit = 30 }) {
    const where = plan ? { plan } : {};
    const [items, total] = await Promise.all([
      prisma.appUser.findMany({ where, orderBy: { lastActiveAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.appUser.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async getAppUser(id) {
    return prisma.appUser.findUnique({
      where: { id },
      include: { feedbacks: { orderBy: { createdAt: "desc" }, take: 10 }, errorLogs: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
  },

  async adjustPoints(id, amount) {
    return prisma.appUser.update({ where: { id }, data: { points: { increment: amount } } });
  },

  async dashboard() {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const [totalUsers, freeUsers, proUsers, activeToday, totalFeedback, pendingFeedback] = await Promise.all([
      prisma.appUser.count(),
      prisma.appUser.count({ where: { plan: "FREE" } }),
      prisma.appUser.count({ where: { plan: "PRO" } }),
      prisma.appUser.count({ where: { lastActiveAt: { gte: today } } }),
      prisma.feedback.count(),
      prisma.feedback.count({ where: { status: "pending" } }),
    ]);
    return { totalUsers, freeUsers, proUsers, activeToday, totalFeedback, pendingFeedback };
  },
};
