const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    status: {
      type: String,
      enum: ["pending", "in_progress", "done"],
      default: "pending",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    dueDate: { type: Date },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 ADD THIS (ISOLATION KEY)
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    aiInsights: {
      suggestedPriority: String,
      estimatedTime: String,
      note: String,
    },

    source: { type: String }, // e.g., "invoice"
    sourceId: { type: mongoose.Schema.Types.ObjectId }, // e.g., invoice._id
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
