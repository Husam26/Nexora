const Invoice = require("../models/Invoice.js");

module.exports = {
  generateInvoiceNumber: async () => {
    const count = await Invoice.countDocuments();
    return `INV-${String(count + 1).padStart(5, "0")}`;
  }
};
