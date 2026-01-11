const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },

    customer: {
      name: { type: String, required: true },
      company: { type: String },
      email: { type: String },
    },

    items: [itemSchema],

    subtotal: Number,
    taxPercent: { type: Number, default: 0 },
    taxAmount: Number,
    discount: { type: Number, default: 0 },
    totalAmount: Number,

    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },

    issueDate: { type: Date, required: true },
    dueDate: { type: Date },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 ADD THIS
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    followUpTaskCreated: { type: Boolean, default: false },
    followUpTaskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
