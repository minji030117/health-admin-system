const { Router } = require("express");
const c = require("../controller/remoteConfig.controller");
const { adminAuth } = require("../../middleware/auth");
const r = Router();

r.get("/", c.getActive);
r.get("/admin", adminAuth, c.listAll);
r.post("/admin", adminAuth, c.create);
r.put("/admin/:id", adminAuth, c.update);
r.delete("/admin/:id", adminAuth, c.remove);

module.exports = r;
