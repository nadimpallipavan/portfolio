# Pavan Nadimpalli · Full-Stack Developer portfolio

My personal developer portfolio: a scroll-driven site (Home, About Me, Technical Skills, Experience, Featured Projects, Education, Resume, Contact) with a small Node.js backend that receives the contact form and emails it to me.

## Tech stack

- **Frontend:** plain HTML, CSS and JavaScript (no build step), [GSAP](https://gsap.com) + ScrollTrigger for scroll animation, [Lenis](https://lenis.darkroom.engineering) for smooth scrolling with a mouse or trackpad. Fonts: Anton and Inter (Google Fonts).
- **Backend:** Node.js 20+ with Express, Helmet (security headers), compression, express-rate-limit, and Nodemailer (SMTP email).
- It adapts to desktop (1025px and wider), tablet (641 to 1024px) and phone (640px and narrower). Phones and tablets use native touch scrolling.

## Folder map

```
portfolio/
  frontend/                    everything the browser loads
    index.html                 the page
    css/style.css              all styles
    js/data.js                 the content (skills, jobs, projects, education, contact)
    js/main.js                 scroll setup, each section's animation, the contact form
    vendor/                    gsap, ScrollTrigger and Lenis (local copies)
    assets/img/                profile photo
    assets/projects/           screenshots of the live projects (with small 720px copies for phones)
    assets/resume/             resume PDF and a page-1 image of it
  backend/
    server.js                  Express app: static files, security headers, compression, /api/health
    routes/contact.js          POST /api/contact (validation, honeypot, rate limit)
    utils/mailer.js            sends the email with Nodemailer
  package.json                 scripts and dependencies
  .env.example                 the environment variables the server reads
  .gitignore                   node_modules, .env, .DS_Store
```

## Run it locally

You need Node.js 20 or newer.

```bash
npm install
cp .env.example .env      # then open .env and fill in the values (optional, only needed to send real email)
npm start                 # http://localhost:3000
```

`npm run dev` does the same but restarts when the backend files change.

Without the SMTP settings the site still works. The contact form then answers "Email is not configured on the server yet" and the page falls back to opening your mail app.

## Environment variables

Set these in `.env` locally, or in the hosting control panel. Never commit a real `.env` file.

| Variable | Meaning |
|---|---|
| `PORT` | Port the server listens on (default `3000`; most hosts set it for you) |
| `SMTP_HOST` | Your email provider's SMTP server |
| `SMTP_PORT` | SMTP port (`465` for SSL, `587` for STARTTLS) |
| `SMTP_USER` | SMTP login (usually the mailbox address) |
| `SMTP_PASS` | SMTP password or app password |
| `MAIL_TO` | Address that receives the contact-form messages |

## API

- `GET /api/health` returns `{ "ok": true }`.
- `POST /api/contact` takes JSON `{ name, email, message, website }`.
  - All of name, email and message are required, the email must look valid, and the message must be 10 to 3000 characters.
  - `website` is a hidden spam-trap field and must stay empty.
  - At most 5 requests per 15 minutes per IP address.
  - The email is sent with Reply-To set to the visitor's address.
  - Answers are JSON: `{ "ok": true }` or `{ "ok": false, "error": "..." }`.

## Caching and updates

The server never caches `index.html`, and caches CSS, JavaScript and images for a year. Every CSS and JS link in `frontend/index.html` ends in a `?v=` number. When you change a CSS or JS file, bump that number in all those links so visitors get the new file.

## Deploy on Hostinger (Node.js app)

1. In hPanel, open **Websites → Add website → Node.js Apps** (or **Node.js** on a hosting plan that supports it).
2. Choose **Import Git repository** and connect `nadimpallipavan/portfolio`, branch `main`.
3. Set the Node.js version to 20 or newer, the **application root** to the repository root, the **start command** to `npm start` (or the **startup file** to `backend/server.js`), and run `npm install`.
4. Add the environment variables from the table above in the app's **Environment variables** section. Use the SMTP details of a mailbox on your Hostinger plan, or another SMTP provider.
5. Deploy. Open your domain and send a test message through the contact form.
6. After a later `git push`, redeploy from hPanel (or turn on automatic deployment) to publish the new version.

## Notes

- Project screenshots are real, unedited screenshots of the live sites.
- The resume PDF in `frontend/assets/resume/` is the public version (it has no phone number). Keep it that way: this repository is public.
