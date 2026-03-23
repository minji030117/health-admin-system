const prisma = require("../../utils/prisma");

module.exports = {
  async getActive() {
    const configs = await prisma.remoteConfig.findMany({ where: { isActive: true } });
    const map = {};
    for (const c of configs) { try { map[c.key] = JSON.parse(c.value); } catch { map[c.key] = c.value; } }
    return map;
  },
  async listAll() { return prisma.remoteConfig.findMany({ orderBy: { key: "asc" } }); },
  async create({ key, value, description }) {
    return prisma.remoteConfig.create({ data: { key, value: JSON.stringify(value), description } });
  },
  async update(id, data) {
    const d = {};
    if (data.value !== undefined) d.value = JSON.stringify(data.value);
    if (data.description !== undefined) d.description = data.description;
    if (data.isActive !== undefined) d.isActive = data.isActive;
    return prisma.remoteConfig.update({ where: { id }, data: d });
  },
  async remove(id) { return prisma.remoteConfig.delete({ where: { id } }); },
};
