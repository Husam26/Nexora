const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/role.middleware");
const { getUsers } = require("../controllers/user.controller");
const { toggleEmailNotifications } = require("../controllers/user.controller");
const { createMember } = require("../controllers/user.controller");
const { getAdminMembers } = require("../controllers/user.controller");
const { resetMemberPassword } = require("../controllers/user.controller");

router.put("/notifications", auth, toggleEmailNotifications);

router.get("/", auth, adminOnly, getUsers);
router.post(
  "/create-member",
  auth,
  adminOnly,
  createMember
);
router.get("/admin-members", auth, adminOnly, getAdminMembers);
router.post("/reset-member-password", auth, adminOnly, resetMemberPassword);


module.exports = router;
