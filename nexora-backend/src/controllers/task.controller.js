const Task = require("../models/Task");
const User = require("../models/User");
const Invoice = require("../models/Invoice");
const { sendEmail } = require("../utils/mailer");

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
   GET TASK BY ID
======================= */
exports.getTaskById = async (req, res) => {
  try {
    const filter = {
      _id: req.params.id,
      workspace: req.user.workspaceId,
    };

    // 🔒 Employee can view ONLY their own task
    if (req.user.role !== "admin") {
      filter.assignedTo = req.user.id;
    }

    const task = await Task.findOne(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name");

    if (!task) {
      return res.status(404).json({ msg: "Task not found or access denied" });
    }

    let context = null;
    if (task.source === "invoice" && task.sourceId) {
      const invoice = await Invoice.findOne({
        _id: task.sourceId,
        workspace: req.user.workspaceId,
      });
      if (invoice) {
        context = {
          type: "invoice",
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          dueDate: invoice.dueDate,
          totalAmount: invoice.totalAmount,
          customer: invoice.customer,
        };
      }
    }

    res.json({ task, context });
  } catch (err) {
    console.error("Get Task By ID Error:", err);
    res.status(500).json({ msg: "Failed to fetch task" });
  }
};

/* =======================
   UPDATE TASK
======================= */
exports.updateTask = async (req, res) => {
  try {
    // Prevent direct status change to "done"
    if (req.body.status === "done") {
      return res.status(400).json({ msg: "Use closeTask API with closedReason to mark task as done" });
    }

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

/* =======================
   CLOSE TASK WITH REASON
======================= */
exports.closeTask = async (req, res) => {
  try {
    const { closedReason } = req.body;

    if (!closedReason) {
      return res.status(400).json({ msg: "Closed reason is required" });
    }

    const filter = {
      _id: req.params.id,
      workspace: req.user.workspaceId,
    };

    // 🔒 Employee can close ONLY their own task
    if (req.user.role !== "admin") {
      filter.assignedTo = req.user.id;
    }

    const task = await Task.findOneAndUpdate(
      filter,
      {
        status: "done",
        closedReason,
        closedAt: new Date(),
        closedBy: req.user.id,
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ msg: "Task not found or access denied" });
    }

    res.json(task);
  } catch (err) {
    console.error("Close Task Error:", err);
    res.status(500).json({ msg: "Failed to close task" });
  }
};

/* =======================
   SEND INVOICE REMINDER EMAIL
======================= */
exports.sendInvoiceReminder = async (req, res) => {
  try {
    const { subject, body } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ msg: "Subject and body are required" });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.user.workspaceId,
    });

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    if (task.source !== "invoice" || !task.sourceId) {
      return res.status(400).json({ msg: "Task is not linked to an invoice" });
    }

    // Check daily reminder limit (max 2 per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const remindersToday = task.reminderLog.filter(
      (log) => log.sentAt >= today && log.sentAt < tomorrow
    ).length;

    if (remindersToday >= 2) {
      return res.status(429).json({ msg: "Daily reminder limit reached (2 per day)" });
    }

    const invoice = await Invoice.findOne({
      _id: task.sourceId,
      workspace: req.user.workspaceId,
    });

    if (!invoice) {
      return res.status(404).json({ msg: "Linked invoice not found" });
    }

    if (!invoice.customer.email) {
      return res.status(400).json({ msg: "Customer email is missing" });
    }

    // Send email
    await sendEmail({
      to: invoice.customer.email,
      subject,
      html: body,
    });

    // Log the reminder
    task.reminderLog.push({ sentAt: new Date() });
    await task.save();

    res.json({ msg: "Reminder email sent successfully" });
  } catch (err) {
    console.error("Send Invoice Reminder Error:", err);
    res.status(500).json({ msg: "Failed to send reminder email" });
  }
};
