const Invoice = require("../models/Invoice");
const { generateInvoiceNumber } = require("../utils/generateInvoiceNumber");
const  calculateInvoice  = require("../utils/calcInvoiceTotals");

/* CREATE INVOICE */
exports.createInvoice = async (req, res) => {
  try {
    const {
      customer,
      items,
      taxPercent = 0,
      discount = 0,
      issueDate,
      dueDate,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Invoice items are required" });
    }

    // 🔥 ALL CALCULATIONS FROM UTIL
    const {
      items: itemsWithTotal,
      subtotal,
      taxAmount,
      totalAmount,
    } = calculateInvoice(items, taxPercent, discount);

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      customer,
      items: itemsWithTotal,
      subtotal,
      taxPercent,
      taxAmount,
      discount,
      totalAmount,
      issueDate,
      dueDate,
      createdBy: req.user.id,
      workspace: req.user.workspaceId,
    });

    res.status(201).json(invoice);
  } catch (err) {
    console.error("Create Invoice Error:", err);
    res.status(500).json({ message: "Failed to create invoice" });
  }
};

/* GET INVOICES */
exports.getInvoices = async (req, res) => {
  try {
    let filter = { workspace: req.user.workspaceId };

    if (req.user.role !== "admin") {
      filter.createdBy = req.user.id;
    }

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET SINGLE */
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      workspace: req.user.workspaceId, // 🔒 isolation
      ...(req.user.role !== "admin" && { createdBy: req.user.id }),
    });

    if (!invoice) {
      return res.status(404).json({ msg: "Invoice not found" });
    }

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* UPDATE STATUS */
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      workspace: req.user.workspaceId,
    });

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    if (
      req.user.role !== "admin" &&
      invoice.createdBy.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    invoice.status = status;
    await invoice.save();

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE INVOICE (ADMIN ONLY) */
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      workspace: req.user.workspaceId, // 🔒
    });

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
