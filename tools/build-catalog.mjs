// Merge docs/catalog-parts/*.json into catalog.json (catalog@1), ordered by category then name.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const partsDir = join(root, "docs/catalog-parts");
const order = ["layout", "navigation", "action", "input", "display", "feedback", "overlay"];
const byName = new Map();
for (const f of readdirSync(partsDir).filter((f) => f.endsWith(".json")).sort()) {
  const part = JSON.parse(readFileSync(join(partsDir, f), "utf8"));
  for (const c of part.components ?? []) {
    if (byName.has(c.name)) console.warn(`duplicate ${c.name} in ${f}; keeping the later one`);
    byName.set(c.name, { ...c, import: "diaphane-ui" });
  }
}
const components = [...byName.values()].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || a.name.localeCompare(b.name));
writeFileSync(join(root, "catalog.json"), JSON.stringify({ schema: "catalog@1", ds: "diaphane", components }, null, 2) + "\n");
console.log(`catalog.json: ${components.length} components`);
