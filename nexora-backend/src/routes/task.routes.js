const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/role.middleware");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");

router.post("/", auth, adminOnly, createTask);
router.get("/", auth, getTasks);
router.put("/:id", auth, updateTask);
router.delete("/:id", auth, adminOnly, deleteTask);

module.exports = router;
