const { Router } = require("express");
const c = require("../controller/errorLog.controller");
const { adminAuth } = require("../../middleware/auth");
const r = Router();

r.post("/", c.create);
r.post("/batch", c.batch);
r.get("/admin", adminAuth, c.list);
r.get("/admin/stats", adminAuth, c.stats);

module.exports = r;
