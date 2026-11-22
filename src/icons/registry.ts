/**
 * Icon registry. The built-in set (./icons.ts) is Lucide artwork. Apps can add their own icons, or override
 * built-in names, with `registerIcons`. Use `lucideIcon` / `lucideBadge` to turn any Lucide icon into a definition.
 */
import { useSyncExternalStore } from "react";
import { icons, type IconDef } from "./icons";

export type { IconDef } from "./icons";
export { strokeIcon as lucideIcon, solidIcon as lucideSolid, badgeIcon as lucideBadge } from "./icons";

const custom = new Map<string, IconDef>();
const listeners = new Set<() => void>();
let version = 0;

/** Add or override icons by name. Safe to call more than once. */
export function registerIcons(defs: Record<string, IconDef>) {
  for (const [name, def] of Object.entries(defs)) custom.set(name, def);
  version++;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }

/** Look up an icon: custom registrations first, then the built-in set; unknown `.fill` names fall back to the outline. */
export function resolveIcon(name: string): IconDef {
  const builtIn = icons as Record<string, IconDef>;
  return (
    custom.get(name) ??
    builtIn[name] ??
    (name.endsWith(".fill") ? custom.get(name.slice(0, -5)) ?? builtIn[name.slice(0, -5)] : undefined) ??
    builtIn["questionmark.circle"]!
  );
}

export function useIcon(name: string): IconDef {
  useSyncExternalStore(subscribe, () => version, () => version);
  return resolveIcon(name);
}
