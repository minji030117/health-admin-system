const prisma = require("../../utils/prisma");

module.exports = {
  async create(data) {
    return prisma.errorLog.create({
      data: { ...data, metadata: data.metadata ? JSON.stringify(data.metadata) : null },
    });
  },
  async createBatch(logs) {
    return prisma.errorLog.createMany({
      data: logs.map(l => ({ ...l, metadata: l.metadata ? JSON.stringify(l.metadata) : null })),
    });
  },
  async list({ level, platform, page = 1, limit = 50 }) {
    const where = {};
    if (level) where.level = level;
    if (platform) where.platform = platform;
    const [items, total] = await Promise.all([
      prisma.errorLog.findMany({
        where, include: { user: { select: { deviceId: true, nickname: true } } },
        orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      }),
      prisma.errorLog.count({ where }),
    ]);
    return { items, total, page, limit };
  },
  async stats() {
    const since = new Date(Date.now() - 86400000);
    const [total, byLevel, byScreen] = await Promise.all([
      prisma.errorLog.count({ where: { createdAt: { gte: since } } }),
      prisma.errorLog.groupBy({ by: ["level"], _count: true, where: { createdAt: { gte: since } } }),
      prisma.errorLog.groupBy({ by: ["screen"], _count: true, where: { createdAt: { gte: since } }, orderBy: { _count: { screen: "desc" } }, take: 10 }),
    ]);
    return { since, total, byLevel, byScreen };
  },
};
