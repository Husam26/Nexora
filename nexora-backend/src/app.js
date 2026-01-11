const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/tasks", require("./routes/task.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/analytics", require("./routes/analytics.routes"));

// 🔥 Smart Invoice Service
app.use("/api/invoices", require("./routes/invoice.routes"));
app.use("/api/automations", require("./routes/emailAutomation.routes"));

module.exports = app;
