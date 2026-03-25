require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 60000, max: 300 }));

app.get("/api/health", (_, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

app.use("/api/feedback", require("./feedback/route/feedback.route"));
app.use("/api/error-log", require("./error-log/route/errorLog.route"));
app.use("/api", require("./user/route/user.route"));
app.use("/api/config", require("./remote-config/route/remoteConfig.route"));

// React 빌드 파일 서빙
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get(/^\/(?!api).*/, (_, res) => res.sendFile(path.join(clientDist, "index.html")));

app.use((err, _req, res, _next) => {
  console.error("[ERR]", err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || "서버 오류" });
});

app.listen(PORT, () => {
  console.log(`\n  건강신호등 관리자 API 서버`);
  console.log(`  http://localhost:${PORT}\n`);
});
