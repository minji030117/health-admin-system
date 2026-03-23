const { Router } = require("express");
const c = require("../controller/user.controller");
const { adminAuth } = require("../../middleware/auth");
const r = Router();

r.post("/auth/login", c.login);
r.post("/user/sync", c.sync);
r.get("/admin/dashboard", adminAuth, c.dashboard);
r.get("/admin/users", adminAuth, c.list);
r.get("/admin/users/:id", adminAuth, c.get);
r.patch("/admin/users/:id/points", adminAuth, c.adjustPoints);

module.exports = r;
