const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/role.middleware");

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  updateInvoice,
  deleteInvoice
} = require("../controllers/invoice.controller");

// Create invoice (Admin + Employee)
router.post("/", auth, createInvoice);

// Get invoices (Admin = all, Employee = own)
router.get("/", auth, getInvoices);

// Get single invoice
router.get("/:id", auth, getInvoiceById);

// Update invoice status
router.put("/:id/status", auth, updateInvoiceStatus);

// Update invoice
router.put("/:id", auth, updateInvoice);

router.delete("/:id", auth, adminOnly, deleteInvoice); // 👈 ADMIN ONLY

module.exports = router;
