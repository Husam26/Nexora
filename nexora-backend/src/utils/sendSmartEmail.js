const transporter = require("./mailer");

const sendSmartEmail = async ({
  to,
  subject,
  html,
  user,
}) => {
  await transporter.sendMail({
    from: `"${user.name} via Nexora" <${process.env.EMAIL_USER}>`,
    replyTo: user.email,
    to,
    subject,
    html,
  });
};

module.exports = { sendSmartEmail };
