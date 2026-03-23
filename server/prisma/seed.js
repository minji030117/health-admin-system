const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@health-traffic.com" },
    update: {},
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

  // 샘플 사용자
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const u = await prisma.appUser.upsert({
      where: { deviceId: `device-sample-${i}` },
      update: {},
      create: {
        deviceId: `device-sample-${i}`,
        nickname: `테스트유저${i}`,
        plan: i <= 3 ? "FREE" : "PRO",
        points: Math.floor(Math.random() * 2000),
        greenRate: Math.random() * 0.9,
        lastActiveAt: new Date(),
      },
    });
    users.push(u);
  }

  // 샘플 피드백
  const categories = ["general", "bug", "feature", "other"];
  const feedbackData = [
    { title: "앱이 가끔 느려요", content: "메인 화면에서 스크롤할 때 가끔 버벅거립니다.", category: "bug" },
    { title: "다크모드 추가해주세요", content: "밤에 쓸 때 눈이 아파서 다크모드가 있으면 좋겠습니다.", category: "feature" },
    { title: "포인트 적립 문의", content: "이번 달 포인트가 적립되지 않았습니다. 확인 부탁드립니다.", category: "general" },
    { title: "QR 스캔 인식률", content: "QR 코드 스캔 인식률이 낮습니다. 개선 부탁드립니다.", category: "bug" },
    { title: "좋은 앱이에요!", content: "건강 관리에 정말 도움이 됩니다. 감사합니다!", category: "other" },
  ];
  for (let i = 0; i < feedbackData.length; i++) {
    const fb = await prisma.feedback.create({
      data: { ...feedbackData[i], userId: users[i % users.length].id, status: i === 0 ? "in_review" : "pending" },
    });
    if (i === 0) {
      await prisma.feedbackReply.create({
        data: { feedbackId: fb.id, adminId: admin.id, content: "확인했습니다. 다음 업데이트에서 성능 최적화를 진행할 예정입니다." },
      });
    }
  }

  // 샘플 에러 로그
  const screens = ["MainScreen", "ScannerScreen", "ResultScreen", "HistoryScreen", "SettingsScreen"];
  for (let i = 0; i < 8; i++) {
    await prisma.errorLog.create({
      data: {
        userId: users[i % users.length].id,
        level: i < 5 ? "error" : i < 7 ? "warn" : "fatal",
        message: [`AsyncStorage read failed`, `Camera permission denied`, `Network timeout`, `JSON parse error`, `Undefined is not an object`, `Memory warning`, `Render timeout`, `Fatal crash on startup`][i],
        screen: screens[i % screens.length],
        platform: i % 2 === 0 ? "web" : "android",
        appVersion: "1.0.0",
      },
    });
  }

  console.log("Seed 완료! 관리자: admin@health-traffic.com / admin1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());
