/**
 * Glass edge refraction (Chromium only).
 *
 * Glass bends the backdrop at its edge: a displacementMap driven by the shape's signed
 * distance field, so content near the rim is pulled inward and magnified.
 * Chromium can do the same with `backdrop-filter: url(#svg-filter)` + feDisplacementMap. WebKit parses that but
 * renders nothing, so this only runs where `navigator.userAgentData` exists (Chrome, Edge, Electron, Arc…);
 * Other browsers keep the tone-mapped glass without the bend.
 *
 * Each glass surface gets a filter built for its own size and corner radius, exposed to CSS as
 * `--dph-glass-refraction: url(#…)`, which the glass rules put in front of `--dph-glass-backdrop`.
 */

/** Glass surfaces that refract. Opaque tinted glass (glassProminent) does not need it. */
export const GLASS_SELECTOR = [
  ".dph-glass",
  '.dph-button[data-variant="glass"]',
  '.dph-icon-button[data-variant="glass"]',
  ".dph-bar-glass",
  '.dph-card[data-variant="glass"]',
  ".dph-page-control[data-background]",
  '.dph-text-field[data-type="search"] .dph-text-field__box',
  ".dph-sheet__button",
].map((s) => `[data-ds="diaphane"] ${s}`).join(", ");

const SVG_NS = "http://www.w3.org/2000/svg";
const DPR = 2;
let defs: SVGDefsElement | null = null;
const made = new Set<string>();

/**
 * Displacement map for a rounded rect: inside an edge band of width `band`, each pixel samples the backdrop
 * further out along the edge normal, by maxShift·t² (t = 1 at the rim, 0 at the band's inner side). Like a real lens
 * (displacement −17.5 on the SDF edge), the rim shows what lies just beyond the glass, bent inward.
 * Encoded for feDisplacementMap (R = x, G = y).
 */
function mapURL(w: number, h: number, r: number, band: number, maxShift: number): string {
  const cw = Math.max(1, Math.round(w * DPR)), ch = Math.max(1, Math.round(h * DPR));
  const c = document.createElement("canvas");
  c.width = cw; c.height = ch;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(cw, ch);
  const hx = w / 2, hy = h / 2, scale = maxShift * 2;
  for (let py = 0; py < ch; py++) {
    for (let px = 0; px < cw; px++) {
      const x = (px + 0.5) / DPR - hx, y = (py + 0.5) / DPR - hy;
      const qx = Math.abs(x) - (hx - r), qy = Math.abs(y) - (hy - r);
      let nx: number, ny: number, d: number; // outward normal, distance inside the edge
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy) || 1;
        nx = qx / len; ny = qy / len; d = r - len;
      } else if (qx > qy) { nx = 1; ny = 0; d = -qx + r; }
      else { nx = 0; ny = 1; d = -qy + r; }
      nx *= Math.sign(x) || 1; ny *= Math.sign(y) || 1;
      const t = Math.max(0, Math.min(1, 1 - d / band));
      const shift = maxShift * t * t;
      const i = (py * cw + px) * 4;
      img.data[i] = Math.round((0.5 + (nx * shift) / scale) * 255);
      img.data[i + 1] = Math.round((0.5 + (ny * shift) / scale) * 255);
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

function filterFor(w: number, h: number, radius: number): string {
  const r = Math.min(radius, w / 2, h / 2);
  // Band ≈ the corner radius (the whole end cap on a capsule), capped at 24pt on large panels; the rim reaches
  // ≈ r/2 beyond the edge (≈ 12pt on the 56pt capsule, matched against the .clear end caps).
  const band = Math.max(4, Math.min(r, 24, Math.min(w, h) / 2));
  const maxShift = Math.max(2, Math.min(r, 24) * 0.5);
  const id = `dph-lg-${Math.round(w)}x${Math.round(h)}r${Math.round(r)}`;
  if (made.has(id)) return id;
  if (!defs) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    defs = document.createElementNS(SVG_NS, "defs");
    svg.appendChild(defs);
    document.body.appendChild(svg);
  }
  const f = document.createElementNS(SVG_NS, "filter");
  f.id = id;
  for (const [k, v] of Object.entries({ x: "0", y: "0", width: `${w}`, height: `${h}`, filterUnits: "userSpaceOnUse", primitiveUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" })) f.setAttribute(k, v);
  const im = document.createElementNS(SVG_NS, "feImage");
  for (const [k, v] of Object.entries({ x: "0", y: "0", width: `${w}`, height: `${h}`, preserveAspectRatio: "none", result: "map" })) im.setAttribute(k, v);
  im.setAttribute("href", mapURL(w, h, r, band, maxShift));
  const dm = document.createElementNS(SVG_NS, "feDisplacementMap");
  for (const [k, v] of Object.entries({ in: "SourceGraphic", in2: "map", scale: `${maxShift * 2}`, xChannelSelector: "R", yChannelSelector: "G" })) dm.setAttribute(k, v);
  f.append(im, dm);
  defs.appendChild(f);
  made.add(id);
  return id;
}

function radiusOf(el: HTMLElement, w: number, h: number): number {
  const v = getComputedStyle(el).borderTopLeftRadius;
  if (v.endsWith("%")) return (parseFloat(v) / 100) * Math.min(w, h);
  return parseFloat(v) || 0;
}

function apply(el: HTMLElement) {
  const w = el.offsetWidth, h = el.offsetHeight; // layout size: ignores the ×1.2133 press transform
  if (!w || !h) return;
  el.style.setProperty("--dph-glass-refraction", `url(#${filterFor(w, h, radiusOf(el, w, h))})`);
}

/** Installs the refraction runtime once. Returns false where the browser cannot render it (WebKit, Firefox). */
export function installGlassRefraction(): boolean {
  if (typeof document === "undefined" || typeof window === "undefined") return false;
  const g = globalThis as { __dphGlassRefraction?: boolean };
  if (g.__dphGlassRefraction !== undefined) return g.__dphGlassRefraction;
  const chromium = !!(navigator as Navigator & { userAgentData?: unknown }).userAgentData;
  g.__dphGlassRefraction = chromium;
  if (!chromium) return false;
  const seen = new WeakSet<Element>();
  const ro = new ResizeObserver((entries) => { for (const e of entries) apply(e.target as HTMLElement); });
  let queued = false;
  const scan = () => {
    queued = false;
    document.querySelectorAll<HTMLElement>(GLASS_SELECTOR).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      ro.observe(el);
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(scan); } };
  const start = () => {
    new MutationObserver(queue).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-variant", "class"] });
    queue();
  };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start, { once: true });
  return true;
}
