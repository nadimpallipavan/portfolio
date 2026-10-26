// Sends the contact-form email with nodemailer. SMTP settings come from environment variables only (see .env.example).
const nodemailer = require("nodemailer");

function isConfigured() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO } = process.env;
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && MAIL_TO);
}

let transporter = null;
function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = SSL from the start; 587 and others upgrade with STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

// Header values must not contain line breaks (stops header injection).
const oneLine = (s) => String(s).replace(/[\r\n]+/g, " ").trim();

async function sendContactMail({ name, email, message }) {
  const safeName = oneLine(name);
  const safeEmail = oneLine(email);
  return getTransporter().sendMail({
    from: `"Portfolio contact form" <${process.env.SMTP_USER}>`, // sent from my own mailbox; the visitor goes in Reply-To
    to: process.env.MAIL_TO,
    replyTo: `"${safeName.replace(/"/g, "")}" <${safeEmail}>`,
    subject: `Portfolio message from ${safeName}`,
    text: `${message}\n\n---\nFrom: ${safeName} <${safeEmail}>`,
  });
}

module.exports = { isConfigured, sendContactMail };
