import { useLayoutEffect, useRef, type ReactNode } from "react";

const MAP: Record<string, string> = { a: "á", e: "ë", i: "ï", o: "ö", u: "ü", A: "Å", E: "Ë", I: "Ï", O: "Ø", U: "Û", c: "ç", n: "ñ", y: "ý" };

/** Pseudo-locale: accents every letter and pads strings by ~40% to catch clipping . */
export function pseudoize(s: string) {
  if (!s.trim()) return s;
  const accented = s.replace(/[aeiouAEIOUcny]/g, (ch) => MAP[ch] ?? ch);
  const pad = "·".repeat(Math.max(1, Math.round(s.length * 0.4)));
  return `[${accented}${pad}]`;
}

/** Rewrites visible text nodes of its subtree after each render (playground only; components stay untouched). */
export function PseudoLocale({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    const walk = () => {
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        const t = n as Text & { __pseudo?: string };
        if (t.__pseudo !== t.data && !/^\[.*\]$/.test(t.data)) { t.data = pseudoize(t.data); t.__pseudo = t.data; }
      }
    };
    walk();
    const mo = new MutationObserver(walk);
    mo.observe(root, { subtree: true, childList: true, characterData: true });
    return () => mo.disconnect();
  });
  return <div ref={ref} style={{ display: "contents" }} key={String(enabled)}>{children}</div>;
}
