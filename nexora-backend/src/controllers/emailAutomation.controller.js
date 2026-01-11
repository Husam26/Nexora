const EmailAutomation = require("../models/EmailAutomation");

exports.createEmailAutomation = async (req, res) => {
  try {
    const { to, subject, context, tone, scheduledAt } = req.body;

    const automation = await EmailAutomation.create({
      workspace: req.user.workspaceId,
      createdBy: req.user.id, // ✅ FIX HERE
      to,
      subject,
      context,
      tone,
      scheduledAt,
    });

    res.status(201).json({
      message: "Email scheduled successfully",
      automation,
    });
  } catch (err) {
    console.error("Create Email Automation Error:", err);
    res.status(500).json({ error: "Failed to schedule email" });
  }
};
