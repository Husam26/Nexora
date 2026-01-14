const cron = require("node-cron");
const Invoice = require("../models/Invoice");
const Task = require("../models/Task");
const User = require("../models/User");

const startInvoiceFollowUpCron = () => {
  // 🕘 EVERY DAY AT 10 AM
  cron.schedule("0 10 * * *", async () => {
    try {
      console.log("📄 Invoice Follow-Up Cron Started");

      const now = new Date();

      // Fetch overdue invoices that haven't had follow-up tasks created
      const overdueInvoices = await Invoice.find({
        dueDate: { $exists: true, $ne: null, $lt: now },
        status: { $ne: "paid" },
        followUpTaskCreated: false,
      });

      console.log(`📄 Overdue invoices found: ${overdueInvoices.length}`);

      for (const invoice of overdueInvoices) {
        // Assign task to invoice creator (employee/admin)
        const assignedUser = await User.findById(invoice.createdBy);

        if (!assignedUser) {
          console.log(
            `⚠️ Creator not found for invoice ${invoice._id}, skipping`
          );
          continue;
        }

        // Create follow-up task
        const task = new Task({
          title: `Follow up for Invoice #${invoice.invoiceNumber}`,
          description: `Invoice due date was ${invoice.dueDate.toDateString()}`,
          priority: "high",
          status: "pending", // or "todo" as per schema
          dueDate: now,
          assignedTo: assignedUser._id,
          createdBy: assignedUser._id,
          workspace: invoice.workspace,
          source: "invoice",
          sourceId: invoice._id,
        });

        await task.save();

        // Update invoice so task is not created again
        invoice.followUpTaskId = task._id;
        invoice.followUpTaskCreated = true;
        await invoice.save();

        console.log(
          `✅ Follow-up task created for invoice ${invoice.invoiceNumber}`
        );
      }

      console.log("📄 Invoice Follow-Up Cron Completed");
    } catch (error) {
      console.error("❌ Error in Invoice Follow-Up Cron:", error);
    }
  });
};

module.exports = { startInvoiceFollowUpCron };