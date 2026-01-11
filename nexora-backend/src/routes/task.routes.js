const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/role.middleware");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  closeTask,
  sendInvoiceReminder,
  deleteTask,
} = require("../controllers/task.controller");

router.post("/", auth, adminOnly, createTask);
router.get("/", auth, getTasks);
router.get("/:id", auth, getTaskById);
router.put("/:id", auth, updateTask);
router.put("/:id/close", auth, closeTask);
router.post("/:id/send-invoice-reminder", auth, sendInvoiceReminder);
router.delete("/:id", auth, adminOnly, deleteTask);

module.exports = router;
