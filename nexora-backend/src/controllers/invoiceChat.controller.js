const mongoose = require("mongoose");
const groq = require("../utils/groqClient");
const Invoice = require("../models/Invoice");
const { invoiceChatPrompt } = require("../utils/prompts");

exports.invoiceChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const { workspaceId } = req.user;

    const lowerMsg = message.toLowerCase();

    /* ----------------------------------
       1️⃣ INTENT DETECTION (CURRENT MESSAGE)
    ---------------------------------- */
    let intent = null;

    if (lowerMsg.includes("discount")) intent = "discount";
    else if (lowerMsg.includes("total") && !lowerMsg.includes("subtotal")) intent = "total"; // strict total
    else if (lowerMsg.includes("tax")) intent = "tax";
    else if (lowerMsg.includes("due date")) intent = "dueDate";
    else if (lowerMsg.includes("issue date") || lowerMsg.includes("issued date")) intent = "issueDate";
    else if (lowerMsg.includes("subtotal")) intent = "subtotal";
    else if (lowerMsg.includes("latest") || lowerMsg.includes("recent")) intent = "latest_invoice";
    else if (lowerMsg.includes("show") || lowerMsg.includes("invoice")) intent = "invoice_details";

    /* ----------------------------------
       2️⃣ AI JSON EXTRACTION
    ---------------------------------- */
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      messages: [{ role: "user", content: invoiceChatPrompt(message) }],
    });

    const aiQuery = JSON.parse(completion.choices[0].message.content || "{}");

    if (!intent && aiQuery.intent) {
      intent = aiQuery.intent;
    }

    /* ----------------------------------
       3️⃣ CUSTOMER / INVOICE EXTRACTION (AI)
    ---------------------------------- */
    let customerName = aiQuery.query?.["customer.name"] || aiQuery.customer || null;
    let invoiceNumber = aiQuery.query?.invoiceNumber || aiQuery.invoiceNumber || null;

    const isJustAName = message.trim().split(" ").length <= 3 && !intent;

    /* ----------------------------------
       3.5️⃣ MANUAL REGEX FALLBACK (CRITICAL FIX)
       If AI missed the name but user said "for [Name]", "about [Name]"
    ---------------------------------- */
    if (!customerName && !invoiceNumber) {
        // Regex looks for "for/about/of" followed by a name, stopping at common keywords or end of string
        const nameRegex = /(?:for|about|of)\s+([a-zA-Z0-9\s]+?)(?:\s+(?:tell|show|give|get|check|calculate|is|the|due|issue|tax|total|discount|invoice)|$)/i;
        const match = lowerMsg.match(nameRegex);
        
        if (match && match[1]) {
             // Clean up accidentally captured stopwords
             const cleaner = match[1].replace(/\b(me|us|please|details|invoice)\b/g, "").trim();
             if (cleaner.length > 2) {
                 customerName = cleaner;
             }
        }
    }

    /* ----------------------------------
       4️⃣ HISTORY FALLBACK (ONLY IF STILL MISSING)
    ---------------------------------- */
    if (history.length) {
      const reversed = [...history].reverse();

      // Only use history if we STILL don't have a name/number from current message
      if (!customerName && !invoiceNumber && !aiQuery.customer) {
        for (const msg of reversed) {
          // Look for the last successful AI response containing data
          if (msg.role === "ai" && msg.data?.length) {
            customerName = msg.data[0]?.customer?.name || null;
            
            // If we found a name in history, use it and stop looking
            if (customerName) {
              invoiceNumber = null; // Clear number to prefer name-based search
              break; 
            }
          }
        }
      }

      // Recover intent ONLY if user sent just a name (e.g. "Chandrahaas")
      if (!intent && isJustAName) {
        for (const msg of reversed) {
          const t = msg.text?.toLowerCase() || "";
          if (t.includes("discount")) { intent = "discount"; break; }
          if (t.includes("total")) { intent = "total"; break; }
          if (t.includes("tax")) { intent = "tax"; break; }
          if (t.includes("due date")) { intent = "dueDate"; break; }
          if (t.includes("issue date")) { intent = "issueDate"; break; }
          if (t.includes("subtotal")) { intent = "subtotal"; break; }
        }
      }
    }

    /* ----------------------------------
       5️⃣ NAME-ONLY FOLLOWUP
    ---------------------------------- */
    if (isJustAName && !customerName) {
      customerName = message.trim();
    }

    /* ----------------------------------
       6️⃣ VALIDATION
    ---------------------------------- */
    const needsContext = ["total", "tax", "discount", "dueDate", "issueDate", "subtotal"];

    if (needsContext.includes(intent) && !customerName && !invoiceNumber) {
      return res.json({
        answer: `Please provide the **customer name** or **invoice number**.`,
        data: [],
      });
    }

    /* ----------------------------------
       7️⃣ DATABASE QUERY
    ---------------------------------- */
    const query = { workspace: new mongoose.Types.ObjectId(workspaceId) };

    if (customerName) {
      // Escape regex special characters just in case
      const safeName = customerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query["customer.name"] = { $regex: new RegExp(safeName.trim(), "i") };
    }

    if (invoiceNumber) {
      query.invoiceNumber = invoiceNumber;
    }

    let data = [];

    if (intent === "latest_invoice") {
      data = await Invoice.find(query).sort({ issueDate: -1 }).limit(1);
    } else {
      data = await Invoice.find(query).sort({ createdAt: -1 });
    }

    if (!data.length) {
      return res.json({
        answer: `No invoices found for **${customerName || invoiceNumber || "this request"}**.`,
        data: [],
      });
    }

    /* ----------------------------------
       8️⃣ ANSWER GENERATION
    ---------------------------------- */
    const inv = data[0];
    const name = inv.customer.name;
    let answer = "";

    switch (intent) {
      case "dueDate":
        answer = `The due date for **${name}** is **${new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}**.`;
        break;

      case "issueDate":
        answer = `The invoice for **${name}** was issued on **${new Date(inv.issueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}**.`;
        break;

      case "subtotal":
        answer = `The subtotal amount for **${name}** is **₹${inv.subtotal.toLocaleString("en-IN")}**.`;
        break;

      case "tax":
        // Summing tax if there are multiple invoices
        const tax = data.reduce((s, i) => s + (i.taxAmount || 0), 0);
        answer = `The total tax charged on **${name}’s invoice(s)** is **₹${tax.toLocaleString("en-IN")}**.`;
        break;

      case "discount":
        const discount = data.reduce((s, i) => s + (i.discount || 0), 0);
        answer = discount > 0
            ? `A discount of **₹${discount.toLocaleString("en-IN")}** has been applied to **${name}’s invoice**.`
            : `There is **no discount applied** to **${name}’s invoice**.`;
        break;

      case "total":
        const total = data.reduce((s, i) => s + (i.totalAmount || 0), 0);
        answer = `The total payable amount for **${name}** is **₹${total.toLocaleString("en-IN")}**.`;
        break;

      case "latest_invoice":
      case "invoice_details":
        answer = `Here are the latest invoice details for **${name}**:\n\nInvoice Number: **${inv.invoiceNumber}**\nTotal Amount: **₹${inv.totalAmount.toLocaleString("en-IN")}**.`;
        break;

      default:
        answer = `I found **${data.length} invoice(s)** for **${name}**. Let me know what details you’d like to check (e.g., tax, discount, due date).`;
    }

    res.json({ answer, data });
  } catch (err) {
    console.error("Nexora Error:", err);
    res.status(500).json({ error: "Intelligence module failed." });
  }
};