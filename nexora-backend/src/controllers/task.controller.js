const Task = require("../models/Task");
const User = require("../models/User");

/* =======================
   CREATE TASK (ADMIN ONLY)
======================= */
exports.createTask = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    // 🔒 Ensure assigned user belongs to same workspace
    const assignedUser = await User.findOne({
      _id: req.body.assignedTo,
      workspace: req.user.workspaceId,
    });

    if (!assignedUser) {
      return res.status(400).json({ msg: "Invalid assignee" });
    }

    const task = await Task.create({
      ...req.body,
      createdBy: req.user.id,
      workspace: req.user.workspaceId,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Task creation failed" });
  }
};

/* =======================
   GET TASKS
======================= */
exports.getTasks = async (req, res) => {
  try {
    const filter = {
      workspace: req.user.workspaceId,
    };

    if (req.user.role !== "admin") {
      filter.assignedTo = req.user.id;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email");

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch tasks" });
  }
};

/* =======================
   UPDATE TASK
======================= */
exports.updateTask = async (req, res) => {
  try {
    const filter = {
      _id: req.params.id,
      workspace: req.user.workspaceId,
    };

    // 🔒 Employee can update ONLY their own task
    if (req.user.role !== "admin") {
      filter.assignedTo = req.user.id;
    }

    const task = await Task.findOneAndUpdate(filter, req.body, {
      new: true,
    });

    if (!task) {
      return res.status(404).json({ msg: "Task not found or access denied" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Task update failed" });
  }
};

/* =======================
   DELETE TASK (ADMIN ONLY)
======================= */
exports.deleteTask = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      workspace: req.user.workspaceId,
    });

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json({ msg: "Task deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed" });
  }
};
