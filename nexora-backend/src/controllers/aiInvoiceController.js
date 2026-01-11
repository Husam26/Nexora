const groq = require("../utils/groqClient");
const { invoicePrompt } = require("../utils/prompts");

exports.generateInvoiceAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: invoicePrompt(prompt) }],
      temperature: 0,
    });

    const aiData = JSON.parse(
      completion.choices[0].message.content
    );

    res.json(aiData);
  } catch (err) {
    console.error("AI Invoice Error:", err);
    res.status(500).json({ error: "Invoice AI failed" });
  }
};
