const OpenAI = require("openai").default;
const Task = require("../models/Task");

const analyzeTask = async (req, res) => {
  try {
    const { title, description, taskId } = req.body;

    const openai = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });

    // STRONG prompt to ensure valid JSON
    const prompt = `
You are a task management assistant. 
Given a task, return a COMPLETE JSON ONLY, do not add extra text or markdown. 
Fields required: "suggestedPriority" (low, medium, high), "estimatedTime" (number + unit), "note" (short reason).

TASK:
Title: ${title}
Description: ${description || "N/A"}
`;

    const response = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 300, // increase to avoid cutting JSON
    });

    let raw = response?.choices?.[0]?.message?.content;

    console.log("RAW AI RESPONSE:", raw);

    if (!raw) throw new Error("Empty AI response");

    raw = raw.replace(/```json|```/g, "").trim();

    // fallback JSON in case AI fails
    let aiData = {
      suggestedPriority: "medium",
      estimatedTime: "1 day",
      note: "AI response was invalid. Default values applied."
    };

    try {
      aiData = JSON.parse(raw);
    } catch (err) {
      console.error("JSON PARSE FAILED:", raw);
    }

    // Calculate dueDate from estimatedTime
    const now = new Date();
    if (aiData.estimatedTime) {
      const match = aiData.estimatedTime.match(/(\d+)/);
      const number = match ? parseInt(match[1]) : 1;
      if (/day/i.test(aiData.estimatedTime)) {
        now.setDate(now.getDate() + number);
      } else {
        now.setHours(now.getHours() + number);
      }
    }
    aiData.dueDate = now;

    if (taskId) {
      await Task.findByIdAndUpdate(taskId, {
        priority: aiData.suggestedPriority,
        dueDate: aiData.dueDate,
        aiInsights: aiData,
      });
    }

    res.json(aiData);
  } catch (err) {
    console.error("AI ERROR:", err.message);
    res.status(500).json({
      msg: "AI analysis failed",
      fallback: {
        suggestedPriority: "medium",
        estimatedTime: "1 day",
        note: "Fallback applied due to AI error",
      },
    });
  }
};

module.exports = { analyzeTask };
