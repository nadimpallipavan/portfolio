// POST /api/contact: validates the form, blocks bots (honeypot + rate limit), then emails me.
const express = require("express");
const rateLimit = require("express-rate-limit");
const { isConfigured, sendContactMail } = require("../utils/mailer");

const router = express.Router();

// 5 requests per 15 minutes per IP address.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ ok: false, error: "Too many messages. Please try again in a few minutes." }),
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

router.post("/", limiter, async (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const website = typeof body.website === "string" ? body.website : "";

  // Hidden honeypot field: people never fill it in, bots do. Pretend it worked so the bot learns nothing.
  if (website) return res.json({ ok: true, message: "Thanks, I'll reply soon." });

  if (!name || !email || !message) return res.status(400).json({ ok: false, error: "Please fill in your name, email and message." });
  if (name.length > 100) return res.status(400).json({ ok: false, error: "Please use a shorter name (up to 100 characters)." });
  if (email.length > 254 || !EMAIL.test(email)) return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
  if (message.length < 10) return res.status(400).json({ ok: false, error: "Please write a little more (at least 10 characters)." });
  if (message.length > 3000) return res.status(400).json({ ok: false, error: "Your message is too long (up to 3000 characters)." });

  if (!isConfigured()) {
    return res.status(503).json({ ok: false, error: "Email is not configured on the server yet. Please email me directly instead." });
  }

  try {
    await sendContactMail({ name, email, message });
    return res.json({ ok: true, message: "Thanks, I'll reply soon." });
  } catch (err) {
    console.error("Contact mail failed:", err.code || err.message); // log the reason, never the settings
    return res.status(502).json({ ok: false, error: "The message could not be sent right now. Please try again later or email me directly." });
  }
});

module.exports = router;
