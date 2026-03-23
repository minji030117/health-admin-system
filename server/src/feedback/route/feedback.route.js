const { Router } = require("express");
const c = require("../controller/feedback.controller");
const { adminAuth } = require("../../middleware/auth");
const r = Router();

r.post("/", c.create);
r.get("/user/:userId", c.listByUser);
r.get("/admin", adminAuth, c.list);
r.get("/admin/:id", adminAuth, c.get);
r.patch("/admin/:id/status", adminAuth, c.updateStatus);
r.post("/admin/:id/reply", adminAuth, c.reply);

module.exports = r;
