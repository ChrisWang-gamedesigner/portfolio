(() => {
  const S = window.SITE;
  if (!S) return;
  const $ = (sel, root = document) => root.querySelector(sel);
  const set = (key, fn) => document.querySelectorAll(`[data-site="${key}"]`).forEach(fn);

  /* ---------- Fill content from config ---------- */
  set("name", (el) => (el.textContent = S.name));
  set("nav", (el) => {
    el.innerHTML = "";
    S.nav.forEach((n) => {
      const a = document.createElement("a");
      a.href = n.href;
      a.textContent = n.label;
      el.appendChild(a);
    });
  });
  set("hero-line1", (el) => (el.textContent = S.hero.line1));
  set("hero-line2", (el) => (el.textContent = S.hero.line2));
  set("hero-line3", (el) => (el.textContent = S.hero.line3));
  set("hero-bg", (el) => (el.src = S.hero.background));
  set("email", (el) => { el.href = `mailto:${S.info.email}`; el.textContent = S.info.email; });
  set("role", (el) => (el.textContent = S.info.role));
  set("colophon", (el) => (el.textContent = S.info.colophon));
  set("year", (el) => (el.textContent = new Date().getFullYear()));
  set("index", (el) => {
    el.innerHTML = "";
    S.projects.forEach((p) => {
      const li = document.createElement("li");
      if (p.link) {
        const a = document.createElement("a");
        a.href = p.link;
        a.textContent = p.title;
        li.appendChild(a);
      } else {
        li.textContent = p.title;
        li.className = "muted";
      }
      el.appendChild(li);
    });
  });

  /* ---------- Reel: one flat queue across all projects ---------- */
  const reel = $("[data-reel]");
  const cfg = Object.assign({ interval: 5500, transition: "fade", pauseOnHover: true }, S.carousel);
  reel.dataset.transition = cfg.transition;

  const queue = [];
  S.projects.forEach((p, pi) => {
    const imgs = p.images && p.images.length ? p.images : [null];
    imgs.forEach((img, ii) => queue.push({ pi, ii, total: imgs.length, img, p }));
  });

  const stage = $(".reel-stage", reel);
  const slides = queue.map((q) => {
    const s = document.createElement("div");
    s.className = "reel-slide";
    if (q.img) {
      const img = document.createElement("img");
      img.src = q.img.src;
      img.alt = q.img.alt || "";
      img.loading = "lazy";
      img.decoding = "async";
      if (q.p.link) {
        const a = document.createElement("a");
        a.href = q.p.link;
        a.tabIndex = -1;
        a.appendChild(img);
        s.appendChild(a);
      } else {
        s.appendChild(img);
      }
    } else {
      s.classList.add("is-text");
      s.innerHTML = `<div class="t-title"></div><div class="t-note"></div><div class="t-meta label"></div>`;
      s.querySelector(".t-title").textContent = q.p.title;
      s.querySelector(".t-note").textContent = q.p.note || "";
      s.querySelector(".t-meta").textContent = q.p.meta || "";
    }
    stage.appendChild(s);
    return s;
  });

  const tabsEl = $(".reel-tabs", reel);
  const tabs = S.projects.map((p, pi) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "reel-tab";
    b.setAttribute("role", "tab");
    b.innerHTML = `<span></span><span class="bar"><i></i></span>`;
    b.firstChild.textContent = p.title;
    b.addEventListener("click", () => go(queue.findIndex((q) => q.pi === pi), true));
    tabsEl.appendChild(b);
    return b;
  });

  const titleEl = $(".reel-title", reel);
  const countEl = $(".reel-count", reel);
  const linkEl = $(".reel-link", reel);
  const pad = (n) => String(n).padStart(2, "0");

  let cur = -1;
  let timer = null;
  let paused = false;
  let started = 0;
  let remaining = cfg.interval;

  function render() {
    const q = queue[cur];
    slides.forEach((s, i) => s.classList.toggle("is-active", i === cur));
    tabs.forEach((t, i) => t.setAttribute("aria-selected", String(i === q.pi)));
    titleEl.textContent = q.p.title;
    countEl.textContent = q.img ? `${pad(q.ii + 1)} / ${pad(q.total)}` : "";
    if (q.p.link) {
      linkEl.hidden = false;
      linkEl.href = q.p.link;
      linkEl.textContent = `${q.p.linkLabel || "View project"} →`;
    } else {
      linkEl.hidden = true;
    }
    // eager-load the next image
    const nx = queue[(cur + 1) % queue.length];
    if (nx.img) new Image().src = nx.img.src;
  }

  // progress bar under the active project tab
  function paintBar() {
    const q = queue[cur];
    const elapsed = paused ? cfg.interval - remaining : cfg.interval - remaining + (performance.now() - started);
    const within = (q.ii + Math.min(elapsed / cfg.interval, 1)) / q.total;
    tabs.forEach((t, i) => {
      const bar = t.querySelector(".bar i");
      bar.style.width = i === q.pi ? `${within * 100}%` : i < q.pi ? "100%" : "0%";
    });
    requestAnimationFrame(paintBar);
  }

  function schedule(ms) {
    clearTimeout(timer);
    started = performance.now();
    remaining = ms;
    timer = setTimeout(() => go(cur + 1), ms);
  }

  function go(i, user = false) {
    cur = (i + queue.length) % queue.length;
    render();
    if (!paused) schedule(cfg.interval);
    else remaining = cfg.interval;
  }

  function pause() {
    if (paused) return;
    paused = true;
    clearTimeout(timer);
    remaining = Math.max(0, remaining - (performance.now() - started));
  }
  function resume() {
    if (!paused) return;
    paused = false;
    schedule(remaining);
  }

  $(".reel-arrow.prev", reel).addEventListener("click", () => go(cur - 1, true));
  $(".reel-arrow.next", reel).addEventListener("click", () => go(cur + 1, true));
  if (cfg.pauseOnHover) {
    const frame = $(".reel-frame", reel);
    frame.addEventListener("mouseenter", pause);
    frame.addEventListener("mouseleave", resume);
    reel.addEventListener("focusin", pause);
    reel.addEventListener("focusout", resume);
  }
  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : resume()));
  reel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(cur - 1, true);
    if (e.key === "ArrowRight") go(cur + 1, true);
  });

  go(0);
  requestAnimationFrame(paintBar);

  /* ---------- Dust in the light ---------- */
  const canvas = $(".hero-dust");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (canvas && !reduce) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, motes;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 26000);
      motes = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.25,
        vx: (Math.random() - 0.5) * 0.06,
        vy: -Math.random() * 0.08 - 0.01,
        tw: Math.random() * Math.PI * 2
      }));
    };
    // brighter inside the raking light (upper right), nearly gone in the dark
    const lightAt = (x, y) => {
      const dx = (x - w * 0.78) / (w * 0.7);
      const dy = (y - h * 0.08) / (h * 0.9);
      return Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
    };
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.x += m.vx; m.y += m.vy; m.tw += 0.012;
        if (m.y < -4) { m.y = h + 4; m.x = Math.random() * w; }
        if (m.x < -4) m.x = w + 4; if (m.x > w + 4) m.x = -4;
        const a = (0.08 + 0.55 * lightAt(m.x, m.y)) * (0.6 + 0.4 * Math.sin(m.tw));
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(236, 226, 205, ${a.toFixed(3)})`;
        ctx.fill();
      }
      requestAnimationFrame(tick);
    };
    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(tick);
  }
})();
