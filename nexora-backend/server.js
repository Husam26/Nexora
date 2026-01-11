require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { startTaskReminderCron } = require("./src/cron/taskReminder");
const cron = require("node-cron");
const runEmailScheduler  = require("./src/cron/emailScheduler");

connectDB();

// ✅ START CRON AFTER DB CONNECT
startTaskReminderCron();

cron.schedule("* * * * *", async () => {
  await runEmailScheduler();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
