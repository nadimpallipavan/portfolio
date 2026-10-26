# Pavan Nadimpalli · portfolio demo

A scroll-driven layout demo of my developer portfolio ("Poster" layout). It is a **demo of the design and motion only**, not the real site.
The real site will be built in **Step 5** with the scroll-starter kit (Next.js), using this demo as the reference.

## How to open it

- **Double-click `index.html`.** It opens in your browser and needs no server and no install.
- The page loads its two fonts (Anton and Inter) from Google Fonts, so it needs an internet connection for the exact look. Without it the fonts fall back to system fonts.
- To jump to a section, add it to the address, for example `index.html#proj`, `#about`, `#resume` or `#contact`. The section ids are `home`, `about`, `skills`, `exp`, `proj`, `more`, `edu`, `resume`, `contact`, `reach`.
- To try it on a phone, serve the folder from your computer (for example `python3 -m http.server 8080` inside this folder) and open `http://<your computer's address>:8080` on the same Wi-Fi.

## What is in it

Eight scroll sections: Home, About Me, Technical Skills, Experience, Featured Projects (a 3D ring of real project screenshots, plus "More builds"), Education, Resume and Contact (with a "Reach me" form).
It adapts to three screen sizes: desktop (1025px and wider), tablet (641 to 1024px) and phone (640px and narrower). Mouse and trackpad get smooth scrolling; phones and tablets use their normal touch scrolling.

## Folder map

```
portfolio-demo/
  index.html            the page: all eight sections as plain HTML
  css/style.css         every style (base rules, then each section, then responsive rules)
  js/data.js            the content (name, skills, jobs, projects, education, contact)
  js/main.js            scroll setup + each section's animation (Home, About, Skills, Experience,
                        Projects, Education, Resume, Contact), grouped and commented
  vendor/               gsap.min.js, ScrollTrigger.min.js, lenis.min.js, lenis.css (copies from the kit's node_modules)
  assets/img/           pavan-portrait.png (not edited)
  assets/projects/      screenshots of the six live sites: <name>-hero.jpg, <name>-full.jpg and small 720px copies (-720)
  assets/resume/        (not in this repo: the resume PDF is added separately)
```

## Notes

- The text comes from `site/CONTENT.md` of the kit project. The phone number is not shown anywhere.
- Project screenshots are real screenshots of the live sites, taken unedited. Phones load the small 720px copies.
- The contact form is a demo: it checks the fields and then opens your mail app with a filled-in `mailto:` link. On the real site it will use a form service (for example Formspree).
- The resume PDF is not included in this repository, so the "Download resume" and "View resume" buttons have no file yet. Put `Pavan_Nadimpalli_Resume.pdf` into `assets/resume/` to enable them.
- Motion is always on (there is no reduced-motion switch), as set in the project rules.
