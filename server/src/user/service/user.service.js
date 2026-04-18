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

  async changePlan(id, plan) {
    if (!["FREE", "PRO"].includes(plan)) throw Object.assign(new Error("유효하지 않은 플랜"), { status: 400 });
    return prisma.appUser.update({ where: { id }, data: { plan } });
  },

  async deleteUser(id) {
    await prisma.feedback.deleteMany({ where: { userId: id } });
    await prisma.errorLog.deleteMany({ where: { userId: id } });
    return prisma.appUser.delete({ where: { id } });
  },

  async bulkChangePlan(ids, plan) {
    if (!["FREE", "PRO"].includes(plan)) throw Object.assign(new Error("유효하지 않은 플랜"), { status: 400 });
    return prisma.appUser.updateMany({ where: { id: { in: ids } }, data: { plan } });
  },

  async accountStats() {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, freeUsers, proUsers,
      freeActiveToday, proActiveToday,
      freeActiveWeek, proActiveWeek,
      freeActiveMonth, proActiveMonth,
      freeAvgPoints, proAvgPoints,
      freeAvgGreen, proAvgGreen,
      newFreeToday, newProToday,
      newFreeWeek, newProWeek,
    ] = await Promise.all([
      prisma.appUser.count(),
      prisma.appUser.count({ where: { plan: "FREE" } }),
      prisma.appUser.count({ where: { plan: "PRO" } }),
      prisma.appUser.count({ where: { plan: "FREE", lastActiveAt: { gte: today } } }),
      prisma.appUser.count({ where: { plan: "PRO", lastActiveAt: { gte: today } } }),
      prisma.appUser.count({ where: { plan: "FREE", lastActiveAt: { gte: weekAgo } } }),
      prisma.appUser.count({ where: { plan: "PRO", lastActiveAt: { gte: weekAgo } } }),
      prisma.appUser.count({ where: { plan: "FREE", lastActiveAt: { gte: monthAgo } } }),
      prisma.appUser.count({ where: { plan: "PRO", lastActiveAt: { gte: monthAgo } } }),
      prisma.appUser.aggregate({ where: { plan: "FREE" }, _avg: { points: true } }),
      prisma.appUser.aggregate({ where: { plan: "PRO" }, _avg: { points: true } }),
      prisma.appUser.aggregate({ where: { plan: "FREE" }, _avg: { greenRate: true } }),
      prisma.appUser.aggregate({ where: { plan: "PRO" }, _avg: { greenRate: true } }),
      prisma.appUser.count({ where: { plan: "FREE", createdAt: { gte: today } } }),
      prisma.appUser.count({ where: { plan: "PRO", createdAt: { gte: today } } }),
      prisma.appUser.count({ where: { plan: "FREE", createdAt: { gte: weekAgo } } }),
      prisma.appUser.count({ where: { plan: "PRO", createdAt: { gte: weekAgo } } }),
    ]);

    return {
      total: { totalUsers, freeUsers, proUsers },
      free: {
        count: freeUsers,
        activeToday: freeActiveToday,
        activeWeek: freeActiveWeek,
        activeMonth: freeActiveMonth,
        avgPoints: Math.round(freeAvgPoints._avg.points || 0),
        avgGreenRate: +(freeAvgGreen._avg.greenRate || 0).toFixed(4),
        newToday: newFreeToday,
        newWeek: newFreeWeek,
      },
      pro: {
        count: proUsers,
        activeToday: proActiveToday,
        activeWeek: proActiveWeek,
        activeMonth: proActiveMonth,
        avgPoints: Math.round(proAvgPoints._avg.points || 0),
        avgGreenRate: +(proAvgGreen._avg.greenRate || 0).toFixed(4),
        newToday: newProToday,
        newWeek: newProWeek,
      },
    };
  },

  async searchUsers({ keyword, plan, sortBy, sortOrder, page = 1, limit = 30 }) {
    const where = {};
    if (plan) where.plan = plan;
    if (keyword) {
      where.OR = [
        { nickname: { contains: keyword } },
        { deviceId: { contains: keyword } },
      ];
    }
    const orderBy = {};
    orderBy[sortBy || "lastActiveAt"] = sortOrder || "desc";

    const [items, total] = await Promise.all([
      prisma.appUser.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      prisma.appUser.count({ where }),
    ]);
    return { items, total, page, limit };
  },
};
