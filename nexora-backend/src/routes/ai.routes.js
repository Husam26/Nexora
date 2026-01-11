const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/role.middleware");
const { generateInvoiceAI } = require("../controllers/aiInvoiceController");
const {invoiceChat} = require("../controllers/invoiceChat.controller");

const {
  analyzeTask,
} = require("../controllers/ai.controller");

router.post(
  "/analyze-task",
  auth,
  adminOnly, // 🔐 ADMIN ONLY
  analyzeTask
);

router.post("/invoice/generate", auth, generateInvoiceAI);

router.post("/invoice/chat", auth, invoiceChat);

module.exports = router;
