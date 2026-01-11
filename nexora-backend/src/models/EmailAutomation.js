const mongoose = require("mongoose");

const emailAutomationSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    to: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    context: {
      type: String,
      default: "",
    },

    tone: {
      type: String,
      enum: ["professional", "friendly", "formal"],
      default: "professional",
    },

    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },

    generatedBody: String,

    status: {
      type: String,
      enum: ["scheduled", "sent", "failed"],
      default: "scheduled",
    },

    sentAt: Date,

    error: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailAutomation", emailAutomationSchema);
