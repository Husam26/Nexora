exports.emailPrompt = ({ subject, context, tone, senderName }) => {
  return `
You are a professional email writer.

Generate a proper business email with:
- Greeting
- Clear paragraphs
- Polite closing
- Signature

Rules:
- DO NOT repeat the subject inside the body
- DO NOT write "Subject:" in the body
- Output ONLY HTML email body (no markdown)

Subject:
${subject}

Context:
${context}

Tone:
${tone}

Sender Name:
${senderName}
`;
};
