// diaphane-ui validator: structural, catalog and accessibility checks (L1–L3). Run with `npm run validate`.
// Usage: node tools/validate.mjs        (exit code 1 if any check fails)
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const json = (p) => JSON.parse(read(p));
const walk = (dir, ext) => readdirSync(join(root, dir)).flatMap((f) => {
  const p = join(dir, f);
  return statSync(join(root, p)).isDirectory() ? walk(p, ext) : f.endsWith(ext) ? [p] : [];
});

const results = [];
const check = (level, name, ok, detail = "") => results.push({ level, name, ok: !!ok, detail });

// ── L1 ──────────────────────────────────────────────────────────────
let manifest = {};
try {
  manifest = json("manifest.json");
  const need = ["id", "name", "version", "entry", "tokens", "catalog", "intents", "rules", "frames", "versions", "assets"];
  const missing = need.filter((k) => !(k in manifest));
  check("L1", "manifest.json valid", !missing.length && manifest.id === "diaphane", missing.length ? `missing: ${missing.join(", ")}` : "");
} catch (e) { check("L1", "manifest.json valid", false, String(e)); }

const css = read("src/styles/tokens.css");
const declared = new Set([...css.matchAll(/(--dph-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
const REQUIRED = ["color.bg", "color.surface", "color.surface.raised", "color.text.primary", "color.text.secondary", "color.accent", "color.accent.on", "color.border", "color.danger", "color.success", "color.warning", "radius.sm", "radius.md", "radius.lg", ...Array.from({ length: 8 }, (_, i) => `space.${i + 1}`), "font.body", "font.title", "font.caption"];
const map = json("tokens.map.json").tokens;
const unmapped = REQUIRED.filter((t) => !map[t]);
const undeclared = Object.entries(map).filter(([, v]) => !declared.has(v)).map(([k, v]) => `${k}→${v}`);
const badExtra = Object.keys(map).filter((k) => !REQUIRED.includes(k) && !k.startsWith("x."));
check("L1", "every required token mapped", !unmapped.length, unmapped.join(", "));
check("L1", "mapped variables exist in tokens.css", !undeclared.length, undeclared.join(", "));
check("L1", "extra tokens prefixed x.", !badExtra.length, badExtra.join(", "));

// Contrast: resolve the generated color blocks, composite alpha over the background.
function block(startsWith) {
  const i = css.indexOf(startsWith);
  if (i < 0) return {};
  const body = css.slice(css.indexOf("{", i) + 1, css.indexOf("}", i));
  return Object.fromEntries([...body.matchAll(/(--dph-[a-z0-9-]+):\s*rgb\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/g)].map((m) => [m[1], [+m[2], +m[3], +m[4], m[5] === undefined ? 1 : +m[5]]]));
}
const modes = {
  light: block('[data-ds="diaphane"],\n[data-ds="diaphane"][data-theme="light"]'),
  dark: block('[data-ds="diaphane"][data-theme="dark"],\n[data-ds="diaphane"] [data-theme="dark"] {\n  --dph-label'),
};
modes.lightHC = { ...modes.light, ...block('[data-ds="diaphane"][data-contrast="high"]') };
modes.darkHC = { ...modes.dark, ...block('[data-ds="diaphane"][data-theme="dark"][data-contrast="high"]') };
const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const over = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)];
const ratio = (fg, bg) => { const a = lum(fg) + 0.05, b = lum(bg) + 0.05; return Math.max(a, b) / Math.min(a, b); };
const onAccentDarkHC = /data-contrast="high"\][^{]*\{\s*--dph-on-accent:\s*rgb\(0 0 0\)/.test(css);
const PAIRS = [
  ["color.text.primary", "color.bg"], ["color.text.primary", "color.surface"],
  ["color.text.secondary", "color.bg"], ["color.text.secondary", "color.surface"],
  ["color.accent.on", "color.accent"], ["color.accent", "color.bg"], ["color.danger", "color.bg"],
];
// Decision (2026-11-20): defaults stay the standard palette; WCAG AA is the opt-in
// data-contrast="high" mode. Default-palette results are reported, AA mode results are enforced.
const info = [];
for (const [mode, vars] of Object.entries(modes)) {
  const v = (t) => (map[t] === "--dph-on-accent" ? (mode === "darkHC" && onAccentDarkHC ? [0, 0, 0, 1] : [255, 255, 255, 1]) : vars[map[t]]);
  const fails = [];
  for (const [fg, bg] of PAIRS) {
    const B = v(bg), F = v(fg);
    if (!B || !F) { fails.push(`${fg}/${bg}: unresolved`); continue; }
    const base = over(B, mode.startsWith("dark") ? [0, 0, 0] : [255, 255, 255]);
    const r = ratio(over(F, base), base);
    if (r < 4.5) fails.push(`${fg} on ${bg} ${r.toFixed(2)}:1`);
  }
  if (mode.endsWith("HC")) check("L1", `WCAG AA text pairs, opt-in data-contrast="high" (${mode.replace("HC", "")})`, !fails.length, fails.join("; "));
  else info.push(`default palette below AA (accepted, see rules.md): ${fails.join("; ") || "none"}`);
}

// Scoping: every selector in every DS stylesheet starts at [data-ds="diaphane"].
const cssFiles = [...walk("src", ".css"), ...walk("frame", ".css")];
const unscoped = [];
for (const f of cssFiles) {
  const text = read(f).replace(/\/\*[\s\S]*?\*\//g, "");
  // @font-face rules cannot be scoped (they only register a family name), so they are exempt like @keyframes.
  const stripped = text.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "").replace(/@font-face\s*\{[^{}]*\}/g, "");
  for (const m of stripped.matchAll(/([^{}@;]+)\{[^{}]*\}/g)) {
    // Split the selector list on top-level commas only (not inside :is()/:not()).
    const sels = []; let depth = 0, cur = "";
    for (const ch of m[1]) { if (ch === "(") depth++; if (ch === ")") depth--; if (ch === "," && !depth) { sels.push(cur); cur = ""; } else cur += ch; }
    sels.push(cur);
    for (const sel of sels.map((s) => s.trim()).filter(Boolean)) {
      if (!sel.startsWith('[data-ds="diaphane"]') && !/^(from|to|\d+%)$/.test(sel)) unscoped.push(`${f}: ${sel.slice(0, 60)}`);
    }
  }
}
check("L1", "all CSS scoped under [data-ds=\"diaphane\"]", !unscoped.length, unscoped.slice(0, 8).join(" | "));

// ── L2 ──────────────────────────────────────────────────────────────
const index = read("src/index.ts");
const exported = new Set([...index.matchAll(/export \{ ([A-Z]\w*) \} from "\.\/components\//g)].map((m) => m[1]));
let catalog = { components: [] };
try { catalog = json("catalog.json"); } catch { /* reported below */ }
const cataloged = new Set(catalog.components.map((c) => c.name));
const notCataloged = [...exported].filter((n) => !cataloged.has(n));
const notExported = [...cataloged].filter((n) => !exported.has(n));
check("L2", "catalog ↔ exports match", catalog.components.length && !notCataloged.length && !notExported.length, [notCataloged.length && `no catalog entry: ${notCataloged}`, notExported.length && `not exported: ${notExported}`].filter(Boolean).join("; "));
check("L2", "index.ts imports tokens.css", /import "\.\/styles\/tokens\.css";/.test(index));

const catProblems = [];
const TYPES = new Set(["enum", "string", "number", "boolean", "callback", "icon", "node", "array", "object"]);
const CATS = new Set(["layout", "navigation", "action", "input", "display", "feedback", "overlay"]);
for (const c of catalog.components) {
  if (!CATS.has(c.category)) catProblems.push(`${c.name}: category ${c.category}`);
  if (!c.use || !c.avoid) catProblems.push(`${c.name}: use/avoid`);
  for (const [p, d] of Object.entries(c.props ?? {})) if (!TYPES.has(d.type)) catProblems.push(`${c.name}.${p}: type ${d.type}`);
  if (!c.props?.testId) catProblems.push(`${c.name}: testId prop`);
}
check("L2", "catalog entries well-formed (types, category, use/avoid, testId)", !catProblems.length, catProblems.slice(0, 8).join("; "));

const comps = [...exported].map((n) => [n, `src/components/${n}.tsx`]).filter(([, p]) => existsSync(join(root, p)));
const issues = { any: [], className: [], testId: [], text: [] };
for (const [n, p] of comps) {
  const src = read(p);
  if (/:\s*any\b|as any\b|<any>/.test(src)) issues.any.push(n);
  const propsBlock = src.match(new RegExp(`interface ${n}Props[^{]*\\{([\\s\\S]*?)\\n\\}`))?.[1] ?? "";
  if (/^\s*(className|style)\??\s*:/m.test(propsBlock)) issues.className.push(n);
  if (!/testId\??\s*:/.test(propsBlock) || !/data-testid=\{testId\}|"data-testid":\s*testId/.test(src)) issues.testId.push(n);
  // Literal words between JSX tags = hardcoded visible text.
  const jsxText = [...src.matchAll(/>\s*([A-Za-z][A-Za-z ,.'!?-]{2,})\s*</g)].map((m) => m[1]).filter((t) => !/^(string|number|boolean)$/.test(t));
  if (jsxText.length) issues.text.push(`${n}: "${jsxText[0]}"`);
}
check("L2", "props typed without any", !issues.any.length, issues.any.join(", "));
check("L2", "no className/style props", !issues.className.length, issues.className.join(", "));
check("L2", "testId → data-testid everywhere", !issues.testId.length, issues.testId.join(", "));
check("L2", "no text inside components", !issues.text.length, issues.text.join("; "));

const physical = [];
for (const f of cssFiles) {
  read(f).split("\n").forEach((line, i) => {
    const l = line.replace(/\/\*.*?\*\//g, "");
    if (/(^|[\s;{])(left|right)\s*:|(margin|padding|border)-(left|right)\b|text-align:\s*(left|right)|float:\s*(left|right)|border-(top|bottom)-(left|right)-radius/.test(l)) physical.push(`${f}:${i + 1}`);
  });
}
for (const [n, p] of comps) {
  const src = read(p);
  // Style-object keys only (a ternary like `r.left : x` that reads geometry is fine).
  if (/[{,]\s*(left|right|marginLeft|marginRight|paddingLeft|paddingRight)\s*:/.test(src)) physical.push(`${p}`);
}
check("L2", "logical CSS only (no left/right)", !physical.length, physical.slice(0, 8).join(", "));

// ── L3 ──────────────────────────────────────────────────────────────
const CORE = ["navigation.top", "navigation.stack", "list", "detail", "form.field", "form.submit", "sheet", "dialog.confirm", "feedback.toast", "empty", "loading", "error"];
try {
  const intents = json("intents.json").intents ?? {};
  const missing = CORE.filter((k) => !(k in intents));
  const names = (v) => (v === null ? [] : typeof v === "string" ? [v] : [v.use, ...(v.with ?? [])]);
  const unknown = Object.entries(intents).flatMap(([k, v]) => names(v).filter((n) => !cataloged.has(n)).map((n) => `${k}→${n}`));
  check("L3", "12 core intents mapped", !missing.length, missing.join(", "));
  check("L3", "intents name catalog components", !unknown.length, unknown.join(", "));
} catch (e) { check("L3", "intents.json", false, String(e)); }

if (existsSync(join(root, "rules.md"))) {
  const rules = read("rules.md");
  const lines = rules.trimEnd().split("\n").length;
  const sections = ["Structure", "Actions", "Forms", "Feedback", "RTL", "Don't"].filter((s) => !new RegExp(`^#+\\s*${s}`, "m").test(rules));
  const named = [...rules.matchAll(/`([A-Z][A-Za-z]+)`/g)].map((m) => m[1]).filter((n) => !cataloged.has(n) && !["Frame"].includes(n));
  check("L3", "rules.md ≤ 150 lines", lines <= 150, `${lines} lines`);
  check("L3", "rules.md sections", !sections.length, `missing: ${sections.join(", ")}`);
  check("L3", "rules.md names real components", !named.length, [...new Set(named)].join(", "));
} else check("L3", "rules.md exists", false);

const framePath = manifest.frames?.[0]?.path;
const frameSrc = framePath && existsSync(join(root, framePath)) ? read(framePath) + read(framePath.replace(/\.tsx$/, ".css")) : "";
check("L3", "frame with safe areas", /export default function Frame/.test(frameSrc) && ["--dph-frame-safe-top", "--dph-frame-safe-bottom", "--dph-frame-safe-start", "--dph-frame-safe-end"].every((v) => frameSrc.includes(v)));
const examples = (manifest.examples ?? []).filter((p) => existsSync(join(root, p)));
check("L3", "2–3 example screens", examples.length >= 2 && examples.length <= 3, `${examples.length} found`);


// Every icon name used in code must resolve to a built-in icon (otherwise the UI shows a question-mark fallback).
{
  const iconSrc = read("src/icons/icons.ts");
  const known = new Set([...iconSrc.matchAll(/"([a-z0-9.]+)": (?:s|solidIcon|badgeIcon)\(/g)].map((m) => m[1]));
  const used = new Map();
  const codeFiles = ["src", "examples", "playground"].flatMap((d) => [...walk(d, ".tsx"), ...walk(d, ".ts")]).filter((f) => !f.startsWith("src/icons/"));
  const re = /(?:icon|minIcon|maxIcon|glyph|symbol|leadingIcon|trailingIcon|activeIcon|iconName)\s*[=:]\s*\{?\s*["`]([a-z][a-z0-9]*(?:\.[a-z0-9]+)*)["`]/g;
  for (const f of codeFiles) for (const m of read(f).matchAll(re)) if (!known.has(m[1]) && !(m[1].endsWith(".fill") && known.has(m[1].slice(0, -5)))) used.set(m[1], f);
  check("L2", "icon names used in code resolve to built-in icons", used.size === 0, [...used].map(([n, f]) => `${n} (${f})`).join(", "));
}

// ── Report ──────────────────────────────────────────────────────────
let failed = 0;
for (const level of ["L1", "L2", "L3"]) {
  console.log(`\n${level}`);
  for (const r of results.filter((r) => r.level === level)) {
    if (!r.ok) failed++;
    console.log(`  ${r.ok ? "✓" : "✗"} ${r.name}${r.ok || !r.detail ? "" : `  — ${r.detail}`}`);
  }
}
for (const line of info) console.log(`\n  • ${line}`);
console.log(`\n${results.length - failed}/${results.length} checks pass`);
process.exit(failed ? 1 : 0);
