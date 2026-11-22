import { useEffect, useState } from "react";

/** Exit durations (ms), matching --dph-motion-* in tokens.css. */
export const EXIT_MS = { alert: 330, popover: 330, sheet: 460, push: 390, pop: 400 } as const;

function reducedMotion(): boolean {
  return typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Keeps an overlay mounted while it animates out. `closing` is true from the moment `open` turns false until the
 * exit animation has had `exitMs` to run; render `data-closing` on the overlay and drive the exit in CSS.
 */
export function usePresence(open: boolean, exitMs: number): { mounted: boolean; closing: boolean } {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (open) { setMounted(true); setClosing(false); return; }
    if (!mounted) return;
    setClosing(true);
    const t = setTimeout(() => { setMounted(false); setClosing(false); }, reducedMotion() ? 0 : exitMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return { mounted: mounted || open, closing: closing && !open };
}
