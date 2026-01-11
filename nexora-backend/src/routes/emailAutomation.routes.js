const express = require("express");
const router = express.Router();
const {
  createEmailAutomation,
} = require("../controllers/emailAutomation.controller");
const auth = require("../middleware/auth.middleware");

// 🔐 All automation routes require login
router.use(auth);

// 📧 Schedule email
router.post("/email", createEmailAutomation);

// (future ready)
// router.get("/email", getMyAutomations);
// router.patch("/email/:id/cancel", cancelAutomation);

module.exports = router;
