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
      invoiceNumber: req.params.id, // <-- use invoiceNumber instead of _id
      workspace: req.user.workspaceId,
    });

    if (!invoice) return res.status(404).json({ msg: "Invoice not found" });

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch invoice" });
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

/* UPDATE INVOICE */
exports.updateInvoice = async (req, res) => {
  try {
    const {
      customer,
      items,
      taxPercent,
      discount,
      issueDate,
      dueDate,
    } = req.body;

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

    // Update fields
    if (customer) invoice.customer = customer;
    if (items) {
      const {
        items: itemsWithTotal,
        subtotal,
        taxAmount,
        totalAmount,
      } = calculateInvoice(items, taxPercent || invoice.taxPercent, discount || invoice.discount);
      invoice.items = itemsWithTotal;
      invoice.subtotal = subtotal;
      invoice.taxAmount = taxAmount;
      invoice.totalAmount = totalAmount;
    }
    if (taxPercent !== undefined) invoice.taxPercent = taxPercent;
    if (discount !== undefined) invoice.discount = discount;
    if (issueDate) invoice.issueDate = issueDate;
    if (dueDate !== undefined) {
      invoice.dueDate = dueDate;
      // Edge case: If dueDate is updated to a future date, reset followUpTaskCreated
      if (dueDate && new Date(dueDate) > new Date()) {
        invoice.followUpTaskCreated = false;
        invoice.followUpTaskId = undefined;
      }
    }

    await invoice.save();

    res.json(invoice);
  } catch (err) {
    console.error("Update Invoice Error:", err);
    res.status(500).json({ message: "Failed to update invoice" });
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
