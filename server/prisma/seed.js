const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("0331", 10);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@health-traffic.com" },
    update: { password: hash },
    create: { email: "admin@health-traffic.com", password: hash, name: "슈퍼관리자", role: "superadmin" },
  });

  const configs = [
    { key: "app_maintenance", value: "false", description: "앱 점검 모드" },
    { key: "min_app_version", value: '"1.0.0"', description: "최소 앱 버전" },
    { key: "ai_lens_cost_free", value: "500", description: "AI 렌즈 비용 (FREE)" },
    { key: "ai_lens_cost_pro", value: "200", description: "AI 렌즈 비용 (PRO)" },
    { key: "monthly_reward_free", value: "100", description: "월간 보상 (FREE)" },
    { key: "monthly_reward_pro", value: "200", description: "월간 보상 (PRO)" },
    { key: "green_threshold", value: "0.65", description: "초록 달성 임계값" },
    { key: "notice_banner", value: '""', description: "공지 배너 텍스트" },
  ];
  for (const c of configs) {
    await prisma.remoteConfig.upsert({ where: { key: c.key }, update: {}, create: c });
  }

  console.log("Seed 완료! 관리자: admin@health-traffic.com / 0331");
}

main().catch(console.error).finally(() => prisma.$disconnect());
