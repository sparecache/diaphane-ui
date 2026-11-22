import { useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import "./Rating.css";

export type RatingSize = "small" | "regular" | "large";
export type RatingTint = "accent" | "orange" | "gray";

export interface RatingProps {
  /** Stars filled, 0…5. Fractions round to the nearest half star when displayed. */
  value: number;
  /** Makes the stars an input ("Tap to Rate"): tap a star or drag across them. Whole stars only. */
  onChange?: (value: number) => void;
  /** Accessible name, e.g. "Design rating". */
  label: string;
  /** small 11pt (rows), regular 17pt, large 30pt (Tap to Rate). Default regular. */
  size?: RatingSize;
  /** Star colour. Default accent for an input, gray for a display. */
  tint?: RatingTint;
  disabled?: boolean;
  testId?: string;
}

const STARS = [1, 2, 3, 4, 5];

/** Five-point star on a 24-unit grid: drawn as a solid shape (not an outline glyph) so small sizes stay crisp. */
const STAR_PATH = "M12 2.3L14.67 9.22L22.08 9.62L16.33 14.31L18.23 21.48L12 17.45L5.77 21.48L7.67 14.31L1.92 9.62L9.33 9.22Z";

/** One star: an outline for the empty part, a solid fill for the filled part (half = leading half). */
function Star({ fill }: { fill: 0 | 0.5 | 1 }) {
  return (
    <svg className="dph-rating__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {fill < 1 && <path className="dph-rating__empty" d={STAR_PATH} />}
      {fill > 0 && <path className="dph-rating__fill" data-half={fill === 0.5 || undefined} d={STAR_PATH} />}
    </svg>
  );
}

/** Five-star rating: display (half stars) or input (tap / drag across, arrow keys). */
export function Rating({ value, onChange, label, size = "regular", tint, disabled, testId }: RatingProps) {
  const box = useRef<HTMLSpanElement>(null);
  const input = !!onChange && !disabled;
  const shown = input ? Math.round(value) : Math.round(value * 2) / 2;
  const pick = (clientX: number) => {
    const el = box.current;
    if (!el || !onChange) return;
    // Hit-test the stars themselves (the row may be stretched by its container): the star whose midpoint-split
    // band contains the finger, clamped to 1…5.
    const stars = [...el.querySelectorAll<HTMLElement>(".dph-rating__star")].map((s) => s.getBoundingClientRect());
    const rtl = getComputedStyle(el).direction === "rtl";
    let v = 1;
    stars.forEach((r, i) => {
      const prev = stars[i - 1];
      const edge = prev ? (rtl ? (prev.left + r.right) / 2 : (prev.right + r.left) / 2) : rtl ? Infinity : -Infinity;
      if (rtl ? clientX <= edge : clientX >= edge) v = i + 1;
    });
    if (v !== value) onChange(v);
  };
  const onDown = (e: ReactPointerEvent) => {
    if (!input) return;
    pick(e.clientX);
    const move = (m: PointerEvent) => pick(m.clientX);
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const onKey = (e: KeyboardEvent) => {
    if (!input || !onChange) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange(Math.min(5, Math.round(value) + 1)); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange(Math.max(1, Math.round(value) - 1)); }
  };
  return (
    <span
      ref={box}
      className="dph-rating"
      data-size={size}
      data-tint={tint ?? (input ? "accent" : "gray")}
      data-input={input || undefined}
      role={input ? "slider" : "img"}
      aria-label={label}
      aria-valuemin={input ? 1 : undefined}
      aria-valuemax={input ? 5 : undefined}
      aria-valuenow={input ? Math.round(value) || undefined : undefined}
      aria-valuetext={input ? `${Math.round(value)} of 5` : undefined}
      aria-disabled={disabled || undefined}
      title={input ? undefined : `${shown} of 5`}
      tabIndex={input ? 0 : undefined}
      onPointerDown={onDown}
      onKeyDown={onKey}
      data-testid={testId}
    >
      {STARS.map((s) => (
        <span key={s} className="dph-rating__star" data-on={shown >= s || undefined} aria-hidden="true">
          <Star fill={shown >= s ? 1 : shown >= s - 0.5 ? 0.5 : 0} />
        </span>
      ))}
    </span>
  );
}

export interface RatingSummaryProps {
  /** Average rating, e.g. 4.6. */
  average: number;
  /** Number of ratings per star level, highest first: [five, four, three, two, one]. */
  distribution: [number, number, number, number, number];
  /** Text under the big number, e.g. "out of 5". */
  outOfLabel: string;
  /** Text under the bars, e.g. "12 Ratings". */
  countLabel: string;
  /** Accessible summary, e.g. "4.6 out of 5, 12 ratings". */
  label: string;
  testId?: string;
}

/** Ratings summary: big average, "out of 5", and a 5→1 star histogram with the rating count. */
export function RatingSummary({ average, distribution, outOfLabel, countLabel, label, testId }: RatingSummaryProps) {
  const max = Math.max(1, ...distribution);
  return (
    <div className="dph-rating-summary" role="img" aria-label={label} data-testid={testId}>
      <div className="dph-rating-summary__score" aria-hidden="true">
        <span className="dph-rating-summary__average">{average.toFixed(1)}</span>
        <span className="dph-rating-summary__out-of">{outOfLabel}</span>
      </div>
      <div className="dph-rating-summary__bars" aria-hidden="true">
        {distribution.map((n, i) => (
          <span key={i} className="dph-rating-summary__row">
            <span className="dph-rating-summary__stars">{Array.from({ length: 5 - i }, (_, k) => <Star key={k} fill={1} />)}</span>
            <span className="dph-rating-summary__track"><span style={{ width: `${(n / max) * 100}%` }} /></span>
          </span>
        ))}
        <span className="dph-rating-summary__count">{countLabel}</span>
      </div>
    </div>
  );
}
