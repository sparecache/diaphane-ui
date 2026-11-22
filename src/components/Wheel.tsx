import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type WheelEvent } from "react";
import { mod } from "./dateParts";
import "./Wheel.css";

/**
 * Internal wheel engine shared by Picker variant="wheel" and DatePicker variant="wheels".
 * Not part of the public catalog.
 *
 * Geometry (see docs/design-specs/pickers.md):
 * 216pt tall; outer rows sit on a cylinder (radius R, angular pitch α) seen through a 900pt perspective centred on the picker,
 * drawn at 44.7% opacity; the selected row is redrawn flat and opaque inside the selection band (quaternarySystemFill capsule,
 * inset 9pt).
 */
export type WheelMetrics = "multi" | "single";
export type WheelAlign = "start" | "center" | "end";

export interface WheelColumn {
  id: string;
  /** Accessible name of the column (spinbutton). */
  label: string;
  count: number;
  selected: number;
  /** Rows wrap around (minutes, months). */
  loop?: boolean;
  /** Row content for index i (0 ≤ i < count). */
  render: (i: number) => ReactNode;
  /** aria-valuetext for index i. */
  text: (i: number) => string;
  /** Text anchor in pt from the picker's inline-start edge, for the selected (band) row and for outer rows.
   *  Omit both to lay the columns out like a picker (equal cells, centred text, outer rows pulled 10% toward the middle). */
  x?: number;
  outerX?: number;
  align?: WheelAlign;
  /** Touch area [start, end] in pt; defaults to the column's cell. */
  hit?: [number, number];
}

export interface WheelProps {
  columns: WheelColumn[];
  metrics?: WheelMetrics;
  /** Fixed width in pt (date picker is 320); omit to fill the container. */
  width?: number;
  onSelect?: (column: number, index: number) => void;
  /** Static content drawn on the band (countdown units). */
  overlay?: ReactNode;
  disabled?: boolean;
  /** Accessible name of the whole group. */
  label?: string;
  testId?: string;
}

const M = {
  //       row pitch, band, cylinder radius, angle per row (rad)
  multi: { pitch: 32, band: 34, r: 97, a: 0.33175 },
  single: { pitch: 30, band: 32, r: 97.5, a: 0.31325 },
} as const;

/** Multi-component picker layout: 9pt side insets, 5pt between components, equal widths. */
function autoLayout(n: number, w: number, i: number) {
  const cw = Math.floor((w - 18 - 5 * (n - 1)) / n);
  const x0 = 9 + i * (cw + 5);
  const c = x0 + cw / 2;
  return { x: c, outerX: w / 2 + 0.9 * (c - w / 2), align: "center" as WheelAlign, hit: [x0, x0 + cw] as [number, number] };
}

const ease = (t: number) => 1 - (1 - t) ** 3;

export function Wheel({ columns, metrics = "multi", width, onSelect, overlay, disabled, label, testId }: WheelProps) {
  const m = M[metrics];
  const rootRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(width ?? 330);
  // Per-column fractional position while dragging/animating; null = show `selected`.
  const [over, setOver] = useState<(number | null)[]>([]);
  const overRef = useRef(over);
  overRef.current = over;
  const anim = useRef<Record<number, number>>({});
  const wheelSnap = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const drag = useRef<{ col: number; y0: number; p0: number; moved: boolean; id: number } | null>(null);

  useLayoutEffect(() => {
    if (width !== undefined) { setW(width); return; }
    const el = rootRef.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  useEffect(() => () => { Object.values(anim.current).forEach(cancelAnimationFrame); Object.values(wheelSnap.current).forEach(clearTimeout); }, []);

  const setPos = useCallback((col: number, p: number | null) => {
    setOver((o) => { const n = [...o]; n[col] = p; return n; });
  }, []);
  const posOf = (col: number) => overRef.current[col] ?? columns[col]?.selected ?? 0;
  const clampIdx = (c: WheelColumn, i: number) => (c.loop ? i : Math.max(0, Math.min(c.count - 1, i)));

  const settle = (col: number, target: number) => {
    const c = columns[col];
    if (!c) return;
    target = clampIdx(c, Math.round(target));
    const from = posOf(col);
    cancelAnimationFrame(anim.current[col] ?? 0);
    const t0 = performance.now();
    const dur = Math.min(400, 160 + Math.abs(target - from) * 40);
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      if (t < 1) { setPos(col, from + (target - from) * ease(t)); anim.current[col] = requestAnimationFrame(step); return; }
      setPos(col, null);
      const idx = c.loop ? mod(target, c.count) : target;
      if (idx !== c.selected) onSelect?.(col, idx);
    };
    anim.current[col] = requestAnimationFrame(step);
  };

  const onPointerDown = (col: number) => (e: PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    cancelAnimationFrame(anim.current[col] ?? 0);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { col, y0: e.clientY, p0: posOf(col), moved: false, id: e.pointerId };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = e.clientY - d.y0;
    if (Math.abs(dy) > 3) d.moved = true;
    if (d.moved) setPos(d.col, d.p0 - dy / m.pitch);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.moved) { settle(d.col, posOf(d.col)); return; }
    // Tap: select the row under the finger (inverse of the cylinder projection).
    const r = e.currentTarget.getBoundingClientRect();
    const dy = e.clientY - (r.top + r.height / 2);
    const k = Math.abs(dy) <= m.band / 2 ? 0 : Math.round(Math.asin(Math.max(-1, Math.min(1, dy / m.r))) / m.a);
    if (k) settle(d.col, d.p0 + k);
  };
  const onWheel = (col: number) => (e: WheelEvent<HTMLDivElement>) => {
    if (disabled || !e.deltaY) return;
    cancelAnimationFrame(anim.current[col] ?? 0);
    const c = columns[col]!;
    let p = posOf(col) + e.deltaY / m.pitch / (e.deltaMode === 1 ? 1 / 16 : 2);
    if (!c.loop) p = Math.max(-0.4, Math.min(c.count - 0.6, p));
    setPos(col, p);
    clearTimeout(wheelSnap.current[col]);
    wheelSnap.current[col] = setTimeout(() => settle(col, posOf(col)), 140);
  };
  const onKeyDown = (col: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const c = columns[col]!;
    const p = Math.round(posOf(col));
    const step: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 };
    let t: number | undefined;
    if (e.key in step) t = p + step[e.key]!;
    else if (e.key === "Home" && !c.loop) t = 0;
    else if (e.key === "End" && !c.loop) t = c.count - 1;
    if (t === undefined) return;
    e.preventDefault();
    settle(col, t);
  };

  const outer: ReactNode[] = [];
  const center: ReactNode[] = [];
  const hits: ReactNode[] = [];
  const maxK = Math.floor(Math.PI / 2 / m.a);
  columns.forEach((c, ci) => {
    const g = c.x === undefined ? autoLayout(columns.length, w, ci) : { x: c.x, outerX: c.outerX ?? c.x, align: c.align ?? "start", hit: c.hit ?? [c.x - 20, c.x + 20] as [number, number] };
    const hit = c.hit ?? g.hit;
    const pos = over[ci] ?? c.selected;
    const base = Math.round(pos);
    for (let i = base - maxK - 1; i <= base + maxK + 1; i++) {
      if (!c.loop && (i < 0 || i >= c.count)) continue;
      const k = i - pos;
      const ang = k * m.a;
      const idx = mod(i, c.count);
      if (Math.abs(ang) < Math.PI / 2 - 0.02) {
        outer.push(
          <div key={`${c.id}:${i}`} className="dph-wheel__row" style={{ transform: `translateZ(${-m.r}px) rotateX(${-ang}rad) translateZ(${m.r}px)` }}>
            <span className="dph-wheel__anchor" data-align={g.align} style={{ insetInlineStart: g.outerX }}>{c.render(idx)}</span>
          </div>,
        );
      }
      if (Math.abs(k) < 1.5) {
        center.push(
          <div key={`${c.id}:${i}`} className="dph-wheel__row" style={{ transform: `translateY(${k * m.pitch}px)` }}>
            <span className="dph-wheel__anchor" data-align={g.align} style={{ insetInlineStart: g.x }}>{c.render(idx)}</span>
          </div>,
        );
      }
    }
    const sel = mod(Math.round(pos), c.count);
    hits.push(
      <div
        key={c.id}
        className="dph-wheel__hit"
        style={{ insetInlineStart: hit[0], width: hit[1] - hit[0] }}
        role="spinbutton"
        tabIndex={disabled ? -1 : 0}
        aria-label={c.label}
        aria-valuenow={sel}
        aria-valuemin={c.loop ? undefined : 0}
        aria-valuemax={c.loop ? undefined : c.count - 1}
        aria-valuetext={c.text(sel)}
        aria-disabled={disabled || undefined}
        onPointerDown={onPointerDown(ci)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel(ci)}
        onKeyDown={onKeyDown(ci)}
      />,
    );
  });

  return (
    <div
      ref={rootRef}
      className="dph-wheel"
      data-metrics={metrics}
      data-disabled={disabled || undefined}
      role="group"
      aria-label={label}
      style={width !== undefined ? { width } : undefined}
      data-testid={testId}
    >
      <div className="dph-wheel__outer" aria-hidden="true">{outer}</div>
      <div className="dph-wheel__center" aria-hidden="true">{center}{overlay}</div>
      {/* The band is drawn over the selected row (the text takes on the fill's tint). */}
      <div className="dph-wheel__band" aria-hidden="true" />
      {hits}
    </div>
  );
}
