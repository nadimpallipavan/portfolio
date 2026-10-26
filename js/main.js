/* Pavan Nadimpalli portfolio demo: scroll setup and every section's animation.
   Order: 1) scroll setup  2) one-time page setup  3) animations per screen size (Home, About, Skills, Experience, Projects, Education, Resume, Contact)  4) start-up.
   Plain scripts, no build step. Needs gsap, ScrollTrigger and Lenis from vendor/ and the content in data.js. */

/* =========================================================================
   1. SCROLL SETUP: GSAP + ScrollTrigger, Lenis smooth scroll (mouse and trackpad only)
   ========================================================================= */
(function () {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  /* touch devices (a phone or tablet whose main pointer is a finger) use native scrolling; mouse and trackpad get Lenis smooth scrolling */
  const touch = matchMedia("(hover: none) and (pointer: coarse)").matches;
  document.documentElement.classList.toggle("touch", touch);
  let lenis;
  if (!touch) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
  } else {
    /* a tiny stand-in with the same few members the pages use */
    let ly = scrollY;
    lenis = {
      velocity: 0,
      get scroll() { return window.scrollY; },
      scrollTo(t, o = {}) { const y = typeof t === "number" ? t : t.getBoundingClientRect().top + window.scrollY; window.scrollTo({ top: y, behavior: o.immediate ? "auto" : "smooth" }); },
      on(ev, fn) { if (ev === "scroll") addEventListener("scroll", fn, { passive: true }); },
      resize() {}, raf() {},
    };
    gsap.ticker.add(() => { lenis.velocity = window.scrollY - ly; ly = window.scrollY; });
  }
  gsap.ticker.lagSmoothing(0);
  window.demo = { gsap, ScrollTrigger, lenis, DATA, touch };   // also used by the test scripts
})();

/* =========================================================================
   2 to 4. PAGE SETUP AND SECTION ANIMATIONS
   ========================================================================= */
window.addEventListener("load", () => {
  const { gsap, lenis, DATA, touch } = window.demo;
  const ScrollTrigger = window.demo.ScrollTrigger;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ======================= ONE-TIME SETUP (DOM that does not depend on the screen size) ======================= */
  /* SKILLS: the two rows of pills */
  const tags = (arr, rot) => arr.map((s, i) => `<span class="tag ${(i + rot) % 3 === 0 ? "f" : (i + rot) % 3 === 1 ? "" : "r"}">${s}</span>`).join("");
  const g = Object.fromEntries(DATA.skillGroups);
  const topSk = [...g["Frontend"], ...g["Backend & APIs"]];
  const restSk = [...new Set([...g["Databases"], ...g["Cloud & DevOps"], ...g["Data & AI"], ...g["Languages"], ...g["Tools"]])];
  const r1 = $(".r1"), r2 = $(".r2");
  r1.innerHTML = tags(topSk, 0).repeat(3);
  r2.innerHTML = tags([...restSk].reverse(), 1).repeat(3);

  /* HOME: one entry per letter (the solid copy and the outline copy together) */
  const home = $("#home"), me = $(".me", home), tag = $(".htag", home);
  const rowsB = [$(".back .n1", home), $(".back .n2", home)], rowsF = [$(".front .n1", home), $(".front .n2", home)];
  const wipe = $(".front .wipe", home), wipeIn = $(".front .wipe-in", home);
  const allRows = [...rowsB, ...rowsF];
  const v1 = $(".v1", home), v2 = $(".v2", home), corners = $$(".corner", home);
  const pairs = [];
  rowsB.forEach((rb, r) => $$(".lm", rb).forEach((lm, i) => {
    const fm = $$(".lm", rowsF[r])[i];
    pairs.push({ row: r, bm: lm, fm, bt: $(".lt", lm), ft: $(".lt", fm), bs: $(".s", lm), fs: $(".s", fm), busy: false, cool: 0, k: 0, tw: null });
  }));

  /* ABOUT: split the sentence into words */
  const aboutEl = $("#about"), sent = $(".sent", aboutEl);
  const txt = sent.textContent.trim().split(/\s+/);
  sent.innerHTML = txt.map((w, i) => `<span class="w${i >= txt.length - 3 ? " hot" : ""}">${w}</span>`).join(" ");

  /* EXPERIENCE: a red copy of each title and a red dot fade in on top (opacity only); remember the desktop positions */
  const expEl = $("#exp"), items = $$(".item", expEl), dots = $$(".dot", expEl);
  items.forEach((it, i) => {
    const h = $("h3", it), w = document.createElement("div"); w.className = "h3w";
    h.parentNode.insertBefore(w, h); w.appendChild(h);
    const r = h.cloneNode(true); r.classList.add("red"); r.setAttribute("aria-hidden", "true"); w.appendChild(r);
    it.dataset.t = it.style.top; dots[i].dataset.t = dots[i].style.top;
  });
  dots.forEach((d) => d.appendChild(document.createElement("b")));

  /* PROJECTS: real screenshots (720px copies for phones via srcset), a 3D ring for desktop and tablet, a swipe carousel for phones */
  const proj = $("#proj");
  const LIVE = [
    { name: "A Fresh Leaf", key: "afreshleaf", dom: "afreshleaf.com", desc: "Company site.", tags: ["MERN stack", "SEO", "Google Search Console"] },
    { name: "GoMunchz", key: "gomunchz", dom: "gomunchz.com", desc: "MERN e-commerce with product catalog, cart, checkout and order management.", tags: ["MERN", "E-commerce"] },
    { name: "Kingston K9 Rescue Reserve", key: "kingstonk9", dom: "kingstonk9.com", desc: "React + Node.js site for a business client.", tags: ["React", "Node.js"] },
    { name: "SaltwaterCam", key: "saltwatercam", dom: "saltwatercam.com", desc: "React + Node.js site for a business client.", tags: ["React", "Node.js"] },
    { name: "HiLoPros", key: "hilopros", dom: "hilopros-com.vercel.app", desc: "React + Node.js site, deployed on Vercel.", tags: ["React", "Node.js", "Vercel"] },
    { name: "Danteswari Daily Needs", key: "danteswari", dom: "danteswaridailyneeds.com", desc: "MERN e-commerce for daily-needs retail.", tags: ["MERN", "E-commerce"], progress: true },
  ];
  const PN = LIVE.length, STEP = 360 / PN;
  const ring = $(".ring", proj);
  const img = (p, kind, cls, sizes) => `<img class="${cls}" alt="${p.name} ${kind === "hero" ? "home page" : "full page"}" decoding="async" data-src="assets/projects/${p.key}-${kind}.jpg" data-srcset="assets/projects/${p.key}-${kind}-720.jpg 720w, assets/projects/${p.key}-${kind}.jpg 1440w" data-sizes="${sizes}">`;
  const SZ_RING = "(max-width:640px) 80vw, (max-width:1024px) 400px, 1440px", SZ_CAR = "80vw";
  const frame = (p, sizes) => `<div class="win"><div class="bar"><i></i><i></i><i></i><span class="addr">${p.dom}</span></div><div class="vp">${img(p, "hero", "h", sizes)}${img(p, "full", "f", sizes)}</div></div>`;
  const infoBits = (p) => `<h3>${p.name}</h3><p class="d">${p.desc}</p><div class="tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}${p.progress ? '<span class="prog">In progress</span>' : ""}</div>`;
  ring.innerHTML = LIVE.map((p, i) => `<article class="scr" tabindex="0" role="link" aria-label="${p.name}: ${i === 0 ? "open " + p.dom : "bring to front"}"><div class="face">${frame(p, SZ_RING)}
    <div class="info">${infoBits(p)}<button class="prev" type="button">Preview</button><a class="visit" href="https://${p.dom}" target="_blank" rel="noopener noreferrer">Visit site ↗</a></div><div class="dimv"></div></div></article>`).join("");
  const car = document.createElement("div"); car.className = "pcar";
  car.innerHTML = `<div class="ptrack" tabindex="0" aria-label="Featured projects, swipe sideways">${LIVE.map((p) => `<article class="slide">${frame(p, SZ_CAR)}<div class="info">${infoBits(p)}<div class="acts"><a class="visit" href="https://${p.dom}" target="_blank" rel="noopener noreferrer">Visit site ↗</a><button class="prev" type="button">Preview</button></div></div></article>`).join("")}</div><div class="pdots">${LIVE.map((p, i) => `<i role="button" aria-label="${p.name}" tabindex="0"></i>`).join("")}</div>`;
  proj.insertBefore(car, $(".meta.b", proj));
  const cards = $$(".scr", ring), faces = $$(".face", ring), dimvs = $$(".dimv", ring);
  const slides = $$(".slide", car), track = $(".ptrack", car), pdots = $$(".pdots i", car);

  /* lazy loading: images get their address only when needed; the small copy is chosen by srcset */
  const loadImg = (im) => { if (im && !im.getAttribute("src")) { im.srcset = im.dataset.srcset; im.sizes = im.dataset.sizes; im.src = im.dataset.src; } };

  /* preview: show the full-page screenshot and scroll it from top to bottom in about 6 seconds */
  const previews = new Map();
  const preview = (root) => {
    if (previews.has(root)) return previews.get(root);
    const vp = $(".vp", root), full = $(".f", vp), btn = $(".prev", root);
    const o = { on: false, tw: null };
    const label = (t) => { if (btn) btn.textContent = t; };
    o.start = () => {
      loadImg(full); o.on = true; vp.classList.add("full"); label("Stop");
      const run = () => {
        if (!o.on) return;
        const dist = Math.max(0, full.offsetHeight - vp.clientHeight);
        o.tw && o.tw.kill();
        o.tw = gsap.fromTo(full, { y: 0 }, { y: -dist, duration: 6, ease: "none", onComplete: () => label("Preview") });
      };
      if (full.complete && full.naturalHeight) run(); else full.addEventListener("load", run, { once: true });
    };
    o.stop = () => {
      o.on = false; o.tw && o.tw.kill(); label("Preview");
      gsap.to(full, { y: 0, duration: 0.5, ease: "power2.out", onComplete: () => { if (!o.on) vp.classList.remove("full"); } });
    };
    previews.set(root, o); return o;
  };
  /* the Preview buttons (touch: the front ring card on tablets, every carousel slide on phones) */
  [...cards, ...slides].forEach((root) => {
    const b = $(".prev", root);
    b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); const p = preview(root); p.on ? p.stop() : p.start(); });
  });

  /* CONTACT: copy email and the form (the same on every screen size) */
  {
    const reach = $("#reach"), MAIL = "Nadimpallipavanms@gmail.com";
    const copied = $("#copied", reach); let ct = 0;
    $("#copyMail", reach).addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(MAIL); }
      catch { const t = document.createElement("textarea"); t.value = MAIL; t.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch {} t.remove(); }
      copied.classList.add("on"); clearTimeout(ct); ct = setTimeout(() => copied.classList.remove("on"), 2000);
    });
    /* Real site: replace with a form service (e.g. Formspree) in Step 5.
       For this demo the form checks the fields, then opens the visitor's mail app with a filled-in mailto link. */
    const form = $("#cform", reach), msg = $("#cmsg", reach);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim(), email = form.email.value.trim(), message = form.message.value.trim();
      const bad = (t) => { msg.className = "msg"; msg.textContent = t; };
      if (!name || !email || !message) return bad("Please fill in your name, email and message.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return bad("Please enter a valid email address.");
      const subject = "Portfolio message from " + name, body = message + "\n\nFrom: " + name + " <" + email + ">";
      msg.className = "msg ok"; msg.textContent = "Opening your mail app…";
      location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  /* ======================= PER-BREAKPOINT SCROLL ANIMATIONS (gsap.matchMedia) ======================= */
  let introPlayed = false;
  const build = (bp, dispose) => {
    const D = bp === "desk", T = bp === "tab", PH = bp === "phone", C = !D;
    const P = D ? 1 : T ? 0.8 : 0.6;                                     // pin lengths: tablet 80%, phone 60% of desktop
    const fine = !touch;                                                  // mouse-only effects
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); dispose.push(() => el.removeEventListener(ev, fn, o)); };
    const reveal = (sec) => {
      const ins = $$("h2 .in", sec);
      if (ins.length) gsap.from(ins, { yPercent: 115, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: sec, start: "top 80%", end: "top 25%", scrub: true } });
    };
    const pin = (sec, n) => gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: { trigger: sec, start: "top top", end: "+=" + Math.round(n * P) + "%", pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true } });
    const vw = () => innerWidth / 100, vh = () => innerHeight / 100;

    /* =====================================================================
       HOME
       ===================================================================== */
    {
      const CAP = 0.865, wPct = D ? 0.9 : 0.92, cyPct = D ? 0.49 : PH ? 0.42 : 0.45;
      let cache = [];
      const fit = () => {
        const W = innerWidth, H = innerHeight;
        allRows.forEach((r) => (r.style.fontSize = "100px"));
        const fs = Math.min(100 * (W * wPct) / rowsB[1].offsetWidth, (H * (H < 500 ? 0.58 : 0.8)) / (CAP * 2 + 0.1));
        allRows.forEach((r) => (r.style.fontSize = fs + "px"));
        const w2 = rowsB[1].offsetWidth, pitch = fs * (CAP + 0.055), cy = H * cyPct;
        const y1 = cy - pitch / 2, y2 = cy + pitch / 2;
        rowsB[0].style.top = rowsF[0].style.top = y1 + "px";
        rowsB[1].style.top = rowsF[1].style.top = y2 + "px";
        tag.style.top = (y2 + CAP * fs / 2 - CAP * fs * 0.06) + "px";
        tag.style.right = ((W - w2) / 2) + "px";
        v1.style.left = (W * 0.86) + "px"; v1.style.top = "0px"; v1.style.height = y1 + "px";
        v2.style.left = (W * 0.1) + "px"; v2.style.top = y2 + "px"; v2.style.height = (H - y2) + "px";
        cache = pairs.map((p) => { const row = rowsB[p.row]; return [W / 2 - row.offsetWidth / 2 + p.bm.offsetLeft + p.bm.offsetWidth / 2, p.row ? y2 : y1]; });
      };
      gsap.set(allRows, { xPercent: -50, yPercent: -50 });
      gsap.set(me, { xPercent: -50 });
      fit();
      ScrollTrigger.addEventListener("refreshInit", fit);
      dispose.push(() => ScrollTrigger.removeEventListener("refreshInit", fit));

      const SYM = "{}<>/=;#$%&*+[]()|~".split("");
      const endScramble = (p) => { p.busy = false; p.bm.classList.remove("sc"); p.fm.classList.remove("sc"); p.cool = performance.now(); };
      const scramble = (p, dur = 0.55) => {
        if (p.busy) return;
        p.busy = true; p.bm.classList.add("sc"); p.fm.classList.add("sc");
        let n = 0;
        p.tw = gsap.to({}, { duration: dur, ease: "none", onUpdate: () => { if (n++ % 3 === 0) p.bs.textContent = p.fs.textContent = SYM[(Math.random() * SYM.length) | 0]; }, onComplete: () => endScramble(p) });
      };
      dispose.push(() => pairs.forEach((p) => { if (p.tw) p.tw.kill(); if (p.busy) endScramble(p); }));

      /* red letter fill near the cursor: mouse only, only while Home is on screen and at rest, positions from the cache */
      if (fine) {
        const C0 = [232, 223, 200], C1 = [255, 75, 58];
        const mix = (k) => `rgb(${C0.map((c, i) => Math.round(c + (C1[i] - c) * k)).join(",")})`;
        let homeOn = true, mx = -9999, my = -9999, raf = 0;
        const clearPaint = () => pairs.forEach((p) => { if (p.k) { p.k = 0; p.bt.style.color = ""; p.ft.style.webkitTextStrokeColor = ""; } });
        const io = new IntersectionObserver((e) => { homeOn = e[0].isIntersecting; if (!homeOn) clearPaint(); }); io.observe(home);
        dispose.push(() => { io.disconnect(); clearPaint(); });
        const paint = () => {
          raf = 0;
          if (!homeOn || lenis.scroll > 60) { clearPaint(); return; }
          const R = Math.min(innerWidth * 0.13, 190), now = performance.now();
          pairs.forEach((p, i) => {
            const d = Math.hypot(mx - cache[i][0], my - cache[i][1]);
            const k = Math.round(Math.pow(Math.max(0, 1 - d / R), 1.3) * 20) / 20;
            if (k !== p.k) { p.k = k; p.bt.style.color = k > 0.02 ? mix(k) : ""; p.ft.style.webkitTextStrokeColor = k > 0.02 ? mix(k) : ""; }
            if (k > 0.75 && now - p.cool > 1400) scramble(p, 0.45);
          });
        };
        on(home, "mousemove", (e) => { if (!homeOn) return; mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(paint); });
        on(home, "mouseleave", () => { mx = my = -9999; paint(); });
      }

      /* load intro (desktop about 2 s, phone at most 1.8 s). Played once; after a resize or rotation the final state is set directly. */
      const finalState = () => {
        gsap.set(pairs.map((p) => p.bt), { yPercent: 0 });
        gsap.set(me, { opacity: 1, scale: 1 });
        gsap.set(wipe, { xPercent: 0 }); gsap.set(wipeIn, { xPercent: 0 });
        gsap.set([tag, ...corners], { opacity: 1 });
        gsap.set([v1, v2], { scaleY: 1, opacity: 0.3 });
      };
      if (!introPlayed) {
        introPlayed = true;
        gsap.set(pairs.map((p) => p.bt), { yPercent: 115 });
        gsap.set(me, { opacity: 0, scale: 1.04, transformOrigin: "50% 100%" });
        gsap.set(wipe, { x: 0, xPercent: -100 }); gsap.set(wipeIn, { x: 0, xPercent: 100 });
        gsap.set([tag, ...corners], { opacity: 0 });
        gsap.set([v1, v2], { scaleY: 0, opacity: 0.3 });
        const lt = gsap.timeline({ delay: 0.15 });
        pairs.forEach((p, i) => {
          const at = p.row === 0 ? i * 0.05 : 0.2 + (i - 5) * 0.05;
          lt.to(p.bt, { yPercent: 0, duration: 0.7, ease: "power3.out" }, at).add(() => scramble(p, 0.55), at);
        });
        lt.to(me, { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 0.2)
          .to(wipe, { xPercent: 0, duration: 0.9, ease: "power2.inOut" }, 0.6)
          .to(wipeIn, { xPercent: 0, duration: 0.9, ease: "power2.inOut" }, 0.6)
          .to([v1, v2], { scaleY: 1, duration: 0.8, ease: "power2.out" }, 0.5)
          .to([tag, ...corners], { opacity: 1, duration: 0.5, stagger: 0.05 }, 1.2);
        if (PH) lt.timeScale(Math.max(1, (lt.duration() + 0.15) / 1.7));
        const GUARD = ["wheel", "touchstart", "keydown", "pointerdown"];
        let done = false;
        const end = () => { if (done) return; done = true; GUARD.forEach((ev) => removeEventListener(ev, finish)); };
        const finish = () => {
          if (done) return;
          lt.progress(1);
          pairs.forEach((p) => { if (p.tw) p.tw.kill(); endScramble(p); });
          end();
        };
        GUARD.forEach((ev) => addEventListener(ev, finish, { passive: true }));
        lenis.on("scroll", () => { if (!done && lenis.scroll > 2) finish(); });
        lt.eventCallback("onComplete", end);
        dispose.push(() => { GUARD.forEach((ev) => removeEventListener(ev, finish)); });
      } else finalState();

      pin(home, 150)
        .to([...allRows, tag], { y: () => -innerHeight * 0.1, duration: 1 }, 0)
        .to(me, { y: () => -innerHeight * 0.04, duration: 1 }, 0)
        .to(allRows, { scaleX: 1.04, duration: 1 }, 0)
        .to([rowsB[0], rowsF[0]], { x: () => -innerWidth * 0.8, duration: 0.6, ease: "power2.in" }, 0.45)
        .to([rowsB[1], rowsF[1], tag], { x: () => innerWidth * 0.8, duration: 0.6, ease: "power2.in" }, 0.45)
        .to($(".dim", home), { opacity: 1, duration: 0.4, ease: "power1.in" }, 0.7);
    }

    /* =====================================================================
       ABOUT: "The Story Deck"
       ===================================================================== */
    {
      const about = aboutEl, ringS = $(".ringS", about), cardsA = $$(".card", about);
      const sw = $$(".w", sent), hot = $$(".hot", sent), icos = $$(".ico", about);
      const RED = "#ff4b3a";
      gsap.set(sent, { yPercent: -50 });
      gsap.set(sw, { scale: 2.6, opacity: 0, y: () => vh() * 4 });
      gsap.set(cardsA, { x: () => vw() * 62, opacity: 0, transformPerspective: 1000 });
      gsap.set(icos, { opacity: 0, y: 24 });
      gsap.set($$(".edge", about), { scaleX: 0 });
      const at = pin(about, 300);
      const E = { ease: "none" };
      at.to(ringS, { rotation: 260, duration: 1, ...E }, 0);
      sw.forEach((w, i) => at.to(w, { scale: 1, opacity: 1, y: 0, duration: 0.07, ease: "power3.out" }, i * 0.032));
      hot.forEach((w) => {
        const t = sw.indexOf(w) * 0.032 + 0.04;
        at.to(w, { color: RED, duration: 0.04, ...E }, t).to(w, { scale: 1.06, duration: 0.016, ease: "power1.out" }, 0.3).to(w, { scale: 1, duration: 0.016, ease: "power1.in" }, 0.316);
      });
      at.to(sent, { scale: 1.04, duration: 0.15, ...E }, 0.2);
      at.to(sent, { scale: 0.35, y: () => -vh() * 39, duration: 0.15, ease: "power2.inOut" }, 0.35);
      const ARR = [0.4, 0.54, 0.68], DUR = 0.12;
      const AGE = [{ scale: 0.92, rotation: -4, y: -20, opacity: 0.5 }, { scale: 0.85, rotation: -8, y: -40, opacity: 0.3 }];
      cardsA.forEach((c, i) => {
        at.fromTo(c, { x: () => vw() * 62, opacity: 0 }, { x: 0, opacity: 1, duration: DUR, ease: "power3.out" }, ARR[i]);
        at.to($(".edge", c), { scaleX: 1, duration: 0.06, ...E }, ARR[i] + DUR - 0.02);
        cardsA.slice(0, i).forEach((o, j) => at.to(o, { ...AGE[i - 1 - j], duration: DUR, ease: "power2.out" }, ARR[i]));
      });
      at.to(icos, { opacity: 1, y: 0, duration: 0.05, stagger: 0.012, ease: "power2.out" }, ARR[2] + 0.02);
      let counted = false;
      at.call(() => {
        if (counted) return; counted = true;
        $$(".c2 .num", about).forEach((n) => { const o = { v: 0 }, to = +n.dataset.to, dec = +n.dataset.dec, suf = n.dataset.suf;
          gsap.to(o, { v: to, duration: 1.3, ease: "power2.out", onUpdate: () => (n.textContent = o.v.toFixed(dec) + suf), onComplete: () => (n.textContent = to.toFixed(dec) + suf) }); });
      }, null, ARR[1] + 0.06);
      const SPREAD = PH ? 20 : T ? 27 : 31;
      const FAN = [{ rotation: -10, x: () => -vw() * SPREAD }, { rotation: 0, x: 0 }, { rotation: 10, x: () => vw() * SPREAD }];
      cardsA.forEach((c, i) => {
        at.to(c, { ...FAN[i], y: 0, scale: 1, opacity: 1, duration: 0.07, ease: "power2.inOut" }, 0.85)
          .to(c, { y: () => -vh() * 115, opacity: 0, duration: 0.08, ease: "power2.in" }, 0.92 + i * 0.01);
      });
      at.to([sent, ringS], { opacity: 0, duration: 0.1, ...E }, 0.9);

      let topC = -1;
      const tilt = fine ? cardsA.map((c) => ({ qx: gsap.quickTo(c, "rotationX", { duration: 0.6, ease: "power3" }), qy: gsap.quickTo(c, "rotationY", { duration: 0.6, ease: "power3" }) })) : null;
      const reset = (i) => { if (!tilt) return; tilt[i].qx(0); tilt[i].qy(0); cardsA[i].classList.remove("lit"); };
      at.eventCallback("onUpdate", () => {
        const p = at.progress(), n = p < 0.52 ? -1 : p < 0.66 ? 0 : p < 0.8 ? 1 : p < 0.85 ? 2 : -1;
        if (n !== topC) { if (topC >= 0) reset(topC); topC = n; }
      });
      let raf = 0, px = 0, py = 0;
      const onMove = (e) => {
        if (topC < 0) return;
        px = e.clientX; py = e.clientY;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0; if (topC < 0) return;
          const c = cardsA[topC], r = c.getBoundingClientRect();
          if (px < r.left || px > r.right || py < r.top || py > r.bottom) { reset(topC); return; }
          const nx = (px - r.left) / r.width - 0.5, ny = (py - r.top) / r.height - 0.5;
          tilt[topC].qy(nx * 12); tilt[topC].qx(-ny * 12);
          c.style.setProperty("--mx", px - r.left + "px"); c.style.setProperty("--my", py - r.top + "px"); c.classList.add("lit");
        });
      };
      const onLeave = () => { if (topC >= 0) reset(topC); };
      ScrollTrigger.create({ trigger: about, start: "top bottom", end: () => at.scrollTrigger.end + innerHeight, invalidateOnRefresh: true, onToggle: (self) => {
        about.classList.toggle("moving", self.isActive);
        if (!fine) return;
        if (self.isActive) { about.addEventListener("pointermove", onMove); about.addEventListener("pointerleave", onLeave); }
        else { about.removeEventListener("pointermove", onMove); about.removeEventListener("pointerleave", onLeave); if (topC >= 0) reset(topC); }
      } });
      dispose.push(() => { about.removeEventListener("pointermove", onMove); about.removeEventListener("pointerleave", onLeave); cardsA.forEach((c) => c.classList.remove("lit")); about.classList.remove("moving"); });
    }

    /* =====================================================================
       SKILLS
       ===================================================================== */
    {
      const skills = $("#skills"); reveal(skills);
      let off = 0, oneW = 1;
      const measure = () => { oneW = r1.scrollWidth / 3; };
      measure(); on(window, "resize", measure);
      let skillsOn = false;
      const io = new IntersectionObserver((e) => (skillsOn = e[0].isIntersecting)); io.observe(skills);
      const tick = (t, dt) => {
        if (!skillsOn) return;
        off += (50 + lenis.velocity * 55) * (dt / 1000);
        const m = ((off % oneW) + oneW) % oneW;
        gsap.set(r1, { x: -m });
        gsap.set(r2, { x: -oneW + m });
      };
      gsap.ticker.add(tick);
      dispose.push(() => { gsap.ticker.remove(tick); io.disconnect(); gsap.set([r1, r2], { clearProps: "transform" }); });
    }

    /* =====================================================================
       EXPERIENCE
       ===================================================================== */
    /* a vertical line on the left, job rows stacked under each other */
    {
      const exp = expEl, line = $(".line", exp), track = $(".track", exp), short = innerHeight < 500;
      reveal(exp);
      /* desktop keeps the original positions; tablet and phone stack the rows one under the other from measured heights */
      const layout = () => {
        if (D) {
          items.forEach((it, i) => { it.style.top = it.dataset.t; dots[i].style.top = dots[i].dataset.t; });
          line.style.top = line.style.height = track.style.top = track.style.height = "";
          return;
        }
        const H = innerHeight, gap = Math.max(14, H * 0.022);
        let y = H * (short ? 0.62 : PH ? 0.215 : 0.24);
        const first = y;
        items.forEach((it, i) => { it.style.top = y + "px"; dots[i].style.top = (y - 6) + "px"; y += it.offsetHeight + gap; });
        const h = y - gap - first + 14;
        exp.style.height = short ? (y + 50) + "px" : "";
        line.style.top = track.style.top = (first - 7) + "px"; line.style.height = track.style.height = h + "px";
      };
      layout();
      ScrollTrigger.addEventListener("refreshInit", layout);
      dispose.push(() => ScrollTrigger.removeEventListener("refreshInit", layout));
      gsap.set(line, { scaleY: 0 });
      const et = (short ? gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: { trigger: exp, start: "top 55%", end: "bottom 75%", scrub: true, invalidateOnRefresh: true } }) : pin(exp, 170)).to(line, { scaleY: 1, duration: 3, ease: "none" }, 0);
      const lineTop = () => parseFloat(getComputedStyle(line).top), lineH = () => parseFloat(getComputedStyle(line).height);
      items.forEach((it, i) => {
        const at = ((parseFloat(getComputedStyle(it).top) - lineTop()) / lineH()) * 3 + 0.05;
        et.to(it, { opacity: 1, x: 12, duration: 0.3, ease: "power2.out" }, at)
          .to($(".red", it), { opacity: 1, duration: 0.3 }, at)
          .to($("b", dots[i]), { opacity: 1, duration: 0.3 }, at)
          .to(dots[i], { scale: 1.5, duration: 0.3 }, at);
      });
      dispose.push(() => { items.forEach((it) => it.style.removeProperty("opacity")); });
    }

    /* =====================================================================
       PROJECTS (3D ring, tablet ring, phone carousel)
       ===================================================================== */
    /* 3D ring (desktop, a smaller flatter one on tablet) or a swipe carousel (phone) */
    {
      reveal(proj);
      if (!PH) {
        const RADIUS = D ? 760 : 540;
        cards.forEach((c, i) => (c.style.transform = `rotateY(${i * STEP}deg) translateZ(${RADIUS}px)`));
        const heroes = $$(".vp .h", ring);
        const io = new IntersectionObserver((e, o) => { if (e.some((x) => x.isIntersecting)) { heroes.forEach(loadImg); o.disconnect(); } }, { rootMargin: "1500px 0px" }); io.observe(proj);
        dispose.push(() => io.disconnect());
        const spin = { r: 0 };
        let front = 0, hover = -1;
        const setFront = (i) => {
          cards.forEach((c, j) => c.classList.toggle("front", j === i));
          loadImg($(".vp .h", cards[i])); loadImg($(".vp .f", cards[i]));
          if (hover !== -1 && hover !== i) { preview(cards[hover]).stop(); hover = -1; }
          cards.forEach((c, j) => { if (j !== i) { const p = previews.get(c); if (p && p.on) p.stop(); } });
          front = i;
        };
        const MIN = D ? 0.68 : 0.76;
        const light = () => {
          faces.forEach((f, i) => {
            const a = (((i * STEP + spin.r) % 360) + 540) % 360 - 180;
            const k = Math.max(0, Math.cos((a * Math.PI) / 180)), w = Math.pow(k, 1.6);
            gsap.set(f, { scale: MIN + (1 - MIN) * w });
            dimvs[i].style.opacity = (0.62 * (1 - w)).toFixed(3);
          });
          const nf = Math.min(PN - 1, Math.max(0, Math.round(-spin.r / STEP)));
          if (nf !== front) setFront(nf);
        };
        gsap.set(ring, { z: -RADIUS });
        const pt = gsap.timeline({ scrollTrigger: { trigger: proj, start: "top top", end: "+=" + Math.round(PN * 70 * P) + "%", pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true } })
          .to(spin, { r: -STEP * (PN - 1), ease: "none", duration: 1, onUpdate: () => { gsap.set(ring, { rotationY: spin.r }); light(); } });
        light(); setFront(0);
        cards.forEach((c, i) => {
          const toFront = () => { const st = pt.scrollTrigger; lenis.scrollTo(st.start + (st.end - st.start) * (i / (PN - 1)), { duration: 1.3 }); };
          const open = () => window.open("https://" + LIVE[i].dom, "_blank", "noopener,noreferrer");
          if (fine) {
            on(c, "mouseenter", () => { if (i === front) { hover = i; preview(c).start(); } });
            on(c, "mouseleave", () => { if (hover === i) { preview(c).stop(); hover = -1; } });
          }
          on(c, "click", (e) => { if (e.target.closest(".visit,.prev")) return; if (i === front) open(); else toFront(); });
          on(c, "keydown", (e) => { if (e.key === "Enter") { if (i === front) open(); else toFront(); } });
        });
        dispose.push(() => cards.forEach((c) => { const p = previews.get(c); if (p && p.on) p.stop(); c.classList.remove("front"); }));
      } else {
        /* phone: swipe carousel, one card at a time (scroll-snap), small dots under it */
        const heroes = $$(".vp .h", car);
        const io = new IntersectionObserver((e, o) => { if (e.some((x) => x.isIntersecting)) { heroes.forEach(loadImg); o.disconnect(); } }, { rootMargin: "1200px 0px" }); io.observe(proj);
        dispose.push(() => io.disconnect());
        let cur = -1, raf = 0;
        const setDot = () => {
          raf = 0;
          const mid = track.scrollLeft + track.clientWidth / 2;
          let best = 0, bd = 1e9;
          slides.forEach((s, i) => { const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
          if (best === cur) return;
          cur = best; pdots.forEach((d, i) => d.classList.toggle("on", i === best));
          slides.forEach((s, i) => { if (i !== best) { const p = previews.get(s); if (p && p.on) p.stop(); } });
        };
        on(track, "scroll", () => { if (!raf) raf = requestAnimationFrame(setDot); }, { passive: true });
        pdots.forEach((d, i) => {
          const go = () => track.scrollTo({ left: slides[i].offsetLeft - (track.clientWidth - slides[i].offsetWidth) / 2, behavior: "smooth" });
          on(d, "click", go); on(d, "keydown", (e) => { if (e.key === "Enter") go(); });
        });
        setDot();
        gsap.from(car, { y: 40, opacity: 0, ease: "power2.out", scrollTrigger: { trigger: proj, start: "top 85%", end: "top 40%", scrub: true } });
        dispose.push(() => slides.forEach((s) => { const p = previews.get(s); if (p && p.on) p.stop(); }));
      }
    }

    /* =====================================================================
       PROJECTS: MORE BUILDS
       ===================================================================== */
    /* the cards flip up one by one (desktop: one timeline; tablet and phone: each card as it arrives) */
    {
      const more = $("#more"), mbs = $$(".mb", more);
      gsap.set(mbs, { rotationX: 70, opacity: 0 });
      if (D) {
        const mt = gsap.timeline({ scrollTrigger: { trigger: more, start: "top 85%", end: "top 22%", scrub: true, invalidateOnRefresh: true } });
        mbs.forEach((c, i) => mt.to(c, { rotationX: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, i * 0.22));
      } else {
        mbs.forEach((c) => gsap.to(c, { rotationX: 0, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: c, start: "top 94%", end: "top 62%", scrub: true } }));
      }
      ScrollTrigger.create({ trigger: more, start: "top bottom", end: "bottom top", onToggle: (self) => more.classList.toggle("moving", self.isActive) });
    }

    /* =====================================================================
       EDUCATION
       ===================================================================== */
    {
      const edu = $("#edu"); reveal(edu);
      $$(".yr", edu).forEach((el) => {
        const o = { n: 0 }, to = +el.dataset.to;
        gsap.to(o, { n: to, snap: { n: 1 }, ease: "none", onUpdate: () => (el.textContent = o.n), scrollTrigger: { trigger: el, start: "top 95%", end: "top 45%", scrub: true } });
      });
    }

    /* =====================================================================
       RESUME
       ===================================================================== */
    {
      const res = $("#resume"), rt = $("h2 span", res);
      gsap.set(rt, { display: "inline-block" });
      gsap.set($$(".btn, .txt", res), { autoAlpha: 0, y: 30 });
      pin(res, 90)
        .fromTo(rt, { scale: () => Math.min(1.65, (innerWidth * 0.94) / (rt.offsetWidth || 1)) }, { scale: 1, duration: 1, ease: "power3.out" }, 0)
        .to($$(".btn, .txt", res), { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.4 }, 0.7);
      if (fine) $$(".btn", res).forEach((b) => {
        const qx = gsap.quickTo(b, "x", { duration: 0.4, ease: "power3" }), qy = gsap.quickTo(b, "y", { duration: 0.4, ease: "power3" });
        on(res, "mousemove", (e) => {
          const r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy);
          if (d < 220) { qx(dx * 0.35); qy(dy * 0.35); } else { qx(0); qy(0); }
        });
        on(res, "mouseleave", () => { qx(0); qy(0); });
      });
    }

    /* =====================================================================
       CONTACT
       ===================================================================== */
    {
      const con = $("#contact"), ct = $("h2", con);
      const fitC = () => { ct.style.fontSize = "100px"; ct.style.fontSize = Math.min(100 * innerWidth * 0.92 / ct.offsetWidth, innerHeight * 0.42) + "px"; };
      fitC();
      ScrollTrigger.addEventListener("refreshInit", fitC);
      dispose.push(() => ScrollTrigger.removeEventListener("refreshInit", fitC));
      gsap.set(ct, { xPercent: -50, scale: 0.12 });
      gsap.set($(".mail", con), { autoAlpha: 0, y: 30 });
      pin(con, 130)
        .to(ct, { scale: 1, duration: 1, ease: "power3.inOut" }, 0)
        .to($(".mail", con), { autoAlpha: 1, y: 0, duration: 0.4 }, 1.05);
    }

    /* =====================================================================
       CONTACT: REACH ME (email buttons and form)
       ===================================================================== */
    /* the form fades and rises in (transform and opacity only) */
    {
      const reach = $("#reach"), rise = $$("[data-rise]", reach);
      if (D) gsap.fromTo(rise, { y: 60, opacity: 0 }, { y: 0, opacity: 1, ease: "power2.out", stagger: 0.15, scrollTrigger: { trigger: reach, start: "top 85%", end: "top 30%", scrub: true, invalidateOnRefresh: true } });
      else rise.forEach((el) => gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 94%", end: "top 66%", scrub: true } }));
    }

  };

  const mm = gsap.matchMedia();
  mm.add({
    desk: "(min-width:1025px) and (min-height:501px)",
    tab: "(min-width:641px) and (max-width:1024px) and (min-height:501px)",
    phone: "(max-width:640px), (max-height:500px)",
  }, (ctx) => {
    const c = ctx.conditions, bp = c.desk ? "desk" : c.tab ? "tab" : "phone", dispose = [];
    document.documentElement.dataset.bp = bp;
    build(bp, dispose);
    return () => dispose.forEach((f) => f());
  });

  /* 4. START-UP: after fonts and images have loaded, re-measure once */
  const imgsReady = Promise.all($$("img").filter((i) => i.getAttribute("src") && !i.complete).map((i) => new Promise((r) => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); })));
  Promise.all([document.fonts.ready, imgsReady]).then(() => { lenis.resize(); ScrollTrigger.refresh(); });
  /* open index.html#proj (or #about, #resume ...) to land straight on a section */
  if (location.hash) document.fonts.ready.then(() => setTimeout(() => {
    ScrollTrigger.refresh();
    const st = ScrollTrigger.getAll().find((t) => t.pin && t.trigger && "#" + t.trigger.id === location.hash);
    if (st) lenis.scrollTo(st.start, { immediate: true }); else { const el = document.querySelector(location.hash); if (el) lenis.scrollTo(el, { immediate: true }); }
  }, 800));
});
