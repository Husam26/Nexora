const EmailAutomation = require("../models/EmailAutomation");
const groq = require("../utils/groqClient");
const { emailPrompt } = require("../utils/emailPrompt");
const { sendEmail } = require("../utils/mailer");

const runEmailScheduler = async () => {
  const now = new Date();

  const jobs = await EmailAutomation.find({
    status: "scheduled",
    scheduledAt: { $lte: now },
  }).populate("createdBy", "name email");

  for (const job of jobs) {
    try {
      const prompt = emailPrompt({
        subject: job.subject,
        context: job.context,
        tone: job.tone,
        senderName: job.createdBy.name,
      });

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }],
      });

      const body = completion.choices[0].message.content;

      await sendEmail({
        to: job.to,
        subject: job.subject,
        html: body, // 👈 HTML better than text
        senderName: job.createdBy.name,
        replyTo: job.createdBy.email,
      });

      job.generatedBody = body;
      job.status = "sent";
      job.sentAt = new Date();
      await job.save();

    } catch (err) {
      job.status = "failed";
      job.error = err.message;
      await job.save();
      console.error("Email Job Failed:", err);
    }
  }
};

module.exports = runEmailScheduler;
