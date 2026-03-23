const prisma = require("../../utils/prisma");

module.exports = {
  async create({ userId, category, title, content }) {
    return prisma.feedback.create({ data: { userId, category, title, content } });
  },
  async list({ status, page = 1, limit = 20 }) {
    const where = status ? { status } : {};
    const [items, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: { user: { select: { deviceId: true, nickname: true, plan: true } }, _count: { select: { replies: true } } },
        orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      }),
      prisma.feedback.count({ where }),
    ]);
    return { items, total, page, limit };
  },
  async getById(id) {
    return prisma.feedback.findUnique({
      where: { id },
      include: {
        user: { select: { deviceId: true, nickname: true, plan: true } },
        replies: { include: { admin: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      },
    });
  },
  async updateStatus(id, status) {
    return prisma.feedback.update({ where: { id }, data: { status } });
  },
  async addReply({ feedbackId, adminId, content }) {
    await prisma.feedback.update({ where: { id: feedbackId }, data: { status: "in_review" } });
    return prisma.feedbackReply.create({ data: { feedbackId, adminId, content } });
  },
  async listByUser(userId) {
    return prisma.feedback.findMany({
      where: { userId },
      include: { replies: { include: { admin: { select: { name: true } } }, orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  },
};
