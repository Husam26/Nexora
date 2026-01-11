const cron = require("node-cron");
const Task = require("../models/Task");
const { sendEmail } = require("../utils/mailer");

const startTaskReminderCron = () => {
  // 🕘 EVERY DAY AT 9 AM
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("⏰ Daily Task Reminder Cron Started");

      const now = new Date();

      const tasks = await Task.find({
        status: { $in: ["pending", "in_progress"] },
        dueDate: { $lt: now }, // overdue tasks only
      }).populate("assignedTo");

      console.log(`📌 Overdue tasks found: ${tasks.length}`);

      for (const task of tasks) {
        const user = task.assignedTo;

        if (!user || !user.emailNotifications) continue;

        await sendEmail({
          to: user.email,
          subject: "⏰ Task Overdue Reminder",
          html: `
            <h2>Hi ${user.name},</h2>
            <p>You have an <b>overdue task</b>:</p>
            <ul>
              <li><b>${task.title}</b></li>
              <li>Status: ${task.status.replace("_", " ")}</li>
              <li>Due Date: ${task.dueDate.toDateString()}</li>
            </ul>
            <p>Please complete it as soon as possible.</p>
            <br/>
            <p>– TaskAI</p>
          `,
        });
      }
    } catch (error) {
      console.error("❌ Task Reminder Cron Error:", error.message);
    }
  });
};

module.exports = { startTaskReminderCron };
