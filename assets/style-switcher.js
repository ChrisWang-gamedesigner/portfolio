/* TEMPORARY: style comparison panel. Delete this file and its <script> tag once a style is chosen. */
(() => {
  const fonts = {
    "Cormorant": '"Cormorant Garamond", Georgia, serif',
    "EB Garamond": '"EB Garamond", Georgia, serif',
    "Playfair": '"Playfair Display", Georgia, serif'
  };
  const accents = {
    "暗金 Gold": "#b39661",
    "锈红 Rust": "#9c4f3d",
    "冷青灰 Slate": "#7f989a"
  };
  const root = document.documentElement;
  const read = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const params = new URLSearchParams(location.search);

  let font = params.get("font") || read("sw-font") || "Cormorant";
  let accent = params.get("accent") || read("sw-accent") || "暗金 Gold";
  if (!fonts[font]) font = "Cormorant";
  if (!accents[accent]) accent = "暗金 Gold";

  const apply = () => {
    root.style.setProperty("--font-display", fonts[font]);
    root.style.setProperty("--accent", accents[accent]);
    write("sw-font", font); write("sw-accent", accent);
    panel.querySelectorAll("button").forEach((b) => {
      const on = (b.dataset.kind === "font" && b.dataset.v === font) || (b.dataset.kind === "accent" && b.dataset.v === accent);
      b.style.borderColor = on ? "#e9e5dc" : "rgba(233,229,220,.18)";
      b.style.color = on ? "#e9e5dc" : "#8a857b";
    });
  };

  const panel = document.createElement("div");
  panel.setAttribute("aria-label", "Temporary style switcher");
  panel.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:99;background:rgba(18,18,19,.94);border:1px solid rgba(233,229,220,.18);padding:12px 14px;font:11px/1.4 ui-monospace,Menlo,monospace;color:#8a857b;display:grid;gap:8px;max-width:320px";
  const row = (title, kind, opts) => {
    const r = document.createElement("div");
    r.innerHTML = `<div style="letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px">${title}</div>`;
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:6px";
    Object.keys(opts).forEach((k) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = k; b.dataset.kind = kind; b.dataset.v = k;
      b.style.cssText = "background:none;border:1px solid;padding:4px 8px;cursor:pointer;font:inherit";
      if (kind === "accent") b.innerHTML = `<span style="display:inline-block;width:8px;height:8px;background:${opts[k]};margin-right:6px"></span>${k}`;
      if (kind === "font") b.style.fontFamily = opts[k];
      if (kind === "font") b.style.fontSize = "14px";
      b.addEventListener("click", () => { if (kind === "font") font = k; else accent = k; apply(); });
      wrap.appendChild(b);
    });
    r.appendChild(wrap);
    return r;
  };
  panel.appendChild(row("Display font", "font", fonts));
  panel.appendChild(row("Accent", "accent", accents));
  const hide = document.createElement("button");
  hide.type = "button"; hide.textContent = "hide";
  hide.style.cssText = "justify-self:end;background:none;border:0;color:#6c685f;cursor:pointer;font:inherit;text-decoration:underline";
  hide.addEventListener("click", () => panel.remove());
  panel.appendChild(hide);

  const mount = () => { document.body.appendChild(panel); apply(); };
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
