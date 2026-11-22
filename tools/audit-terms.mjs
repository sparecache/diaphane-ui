// Guards the repository against third-party marks and non-open assets creeping back in.
// Usage: node tools/audit-terms.mjs   (exit code 1 on any finding)  ·  npm run audit
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

// Words that must not appear in code, comments or docs. The project is "inspired by" a design language; it never
// reproduces or references a vendor's software, fonts, icons, frameworks or documentation by name.
const FORBIDDEN = [
  "iOS", "iPhone", "iPad", "iPadOS", "macOS", "watchOS", "visionOS", "Apple", "Cupertino",
  "SwiftUI", "UIKit", "Swift Charts", "SF Symbol", "SF Symbols", "SF Pro", "SF Mono", "San Francisco",
  "Liquid Glass", "Dynamic Island", "Dynamic Type", "HIG", "Human Interface", "Xcode", "Siri", "iCloud",
  "Apple Pay", "Infinite Loop", "Apple Park", "Core Animation", "simulator", "Appleseed",
];
const re = new RegExp(`(?<![A-Za-z0-9-])(${FORBIDDEN.map((w) => w.replace(/ /g, "\\s")).join("|")})(?![A-Za-z0-9])`);

// Files where a limited, reviewed mention is intentional (disclaimer, contribution rules, licences, descriptions).
const ALLOW = new Map([
  ["README.md", ["iOS", "iPhone", "iPad", "Apple", "SF Symbols"]],
  ["CONTRIBUTING.md", ["Apple", "simulator"]],
  ["package.json", ["iOS"]],
  ["manifest.json", ["iOS"]],
  ["tools/audit-terms.mjs", FORBIDDEN],
]);
const SKIP = /(^|\/)(package-lock\.json|THIRD_PARTY_NOTICES\.md|LICENSE)$|\.(woff2|png)$/;

const files = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { encoding: "utf8" }).split("\n").filter(Boolean);
const findings = [];
for (const f of files) {
  if (SKIP.test(f) || !existsSync(f)) continue;
  const allowed = ALLOW.get(f) ?? [];
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    const m = line.match(re);
    if (m && !allowed.some((a) => m[1].startsWith(a))) findings.push(`${f}:${i + 1}: "${m[1]}"  ${line.trim().slice(0, 90)}`);
  });
}

// Original flat illustrations (text SVG) used by the example flows are allowed under examples/flows/art/.
// Only these binary types are allowed, and only in these folders (screenshots and banner we rendered, the open font we bundle).
const binaries = files.filter((f) => !/\.(tsx?|css|json|md|mjs|html|txt|yml|yaml)$/.test(f) && !/^examples\/flows\/art\/[a-z0-9-]+\.svg$/.test(f) && !/(^|\/)(LICENSE|\.gitignore|\.gitattributes|\.editorconfig|\.nvmrc)$/.test(f));
for (const b of binaries) {
  const ok = (/^docs\/(screenshots|assets)\/.*\.png$/.test(b)) || (/^src\/fonts\/inter-.*\.woff2$/.test(b));
  if (!ok) findings.push(`${b}: unexpected binary or asset file`);
}

if (findings.length) {
  console.error(`✗ audit failed (${findings.length})\n` + findings.join("\n"));
  process.exit(1);
}
console.log(`✓ audit passed: ${files.length} files, no third-party marks, ${binaries.length} allowed binaries`);
