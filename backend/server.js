// Express server: serves the frontend/ folder and the contact API.
// Run with `npm start` (or `npm run dev`). Settings come from environment variables (see .env.example).
const path = require("path");
const fs = require("fs");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");

// Optional local .env file (Node 20.12+). On a host such as Hostinger, set the variables in the control panel instead.
const envFile = path.join(__dirname, "..", ".env");
if (fs.existsSync(envFile) && typeof process.loadEnvFile === "function") process.loadEnvFile(envFile);

const contactRoute = require("./routes/contact");

const app = express();
const FRONTEND = path.join(__dirname, "..", "frontend");
const PORT = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");
app.set("trust proxy", 1); // behind a host's proxy, so the rate limit sees the visitor's real IP

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "style-src": ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "img-src": ["'self'", "data:"],
        "script-src": ["'self'", "'unsafe-inline'"], // index.html has one tiny inline script that picks the layout before the first paint
        "frame-src": ["'self'"],
        "upgrade-insecure-requests": null,
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
  })
);
app.use(compression());
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => res.json({ ok: true, uptime: Math.round(process.uptime()) }));
app.use("/api/contact", contactRoute);
app.use("/api", (req, res) => res.status(404).json({ ok: false, error: "Not found." }));
app.use((err, req, res, next) => {
  // bad JSON and other request errors: a clear answer, never a crash or a stack trace
  if (res.headersSent) return next(err);
  const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 500;
  res.status(status).json({ ok: false, error: status === 500 ? "Server error." : "Bad request." });
});

// Static files. HTML is never cached; CSS, JS, images and fonts are cached for a year because
// every CSS/JS link in index.html carries a ?v= number that changes whenever the file changes.
app.use(
  express.static(FRONTEND, {
    etag: true,
    lastModified: true,
    setHeaders(res, file) {
      if (file.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
      else if (file.endsWith(".pdf")) res.setHeader("Cache-Control", "no-cache");
      else if (/\.(css|js|woff2?|png|jpe?g|webp|svg|ico)$/i.test(file)) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  })
);

app.use((req, res) => res.status(404).sendFile(path.join(FRONTEND, "index.html"), { headers: { "Cache-Control": "no-cache" } }));

app.listen(PORT, (err) => {
  // Express 5 passes a start-up error (for example "port already in use") to this callback; say so and stop instead of claiming success.
  if (err) {
    console.error(err.code === "EADDRINUSE" ? `Port ${PORT} is already in use. Start with a free port, for example: PORT=3001 npm start` : err.message);
    process.exit(1);
  }
  console.log(`Portfolio running on http://localhost:${PORT}`);
});
