import { useRef, type KeyboardEvent } from "react";
import { Icon, type IconName } from "./Icon";
import "./SegmentedControl.css";

export interface Segment {
  /** Visible title, or the accessible name when `icon` is set. */
  label: string;
  /** Icon name: renders an icon-only segment. */
  icon?: IconName;
  disabled?: boolean;
  testId?: string;
}

export interface SegmentedControlProps {
  /** 2–5 segments. */
  segments: Segment[];
  /** Index of the selected segment. */
  selected: number;
  onChange?: (index: number) => void;
  disabled?: boolean;
  /** Accessible name of the group. */
  label?: string;
  testId?: string;
}

/** Picker with .pickerStyle(.segmented): equal-width segments on a capsule track with a sliding thumb. Fills its container's width. */
export function SegmentedControl({ segments, selected, onChange, disabled, label, testId }: SegmentedControlProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = segments.length;
  const move = (from: number, step: number) => {
    for (let k = 1; k <= n; k++) {
      const i = (from + step * k + n * k) % n;
      if (!segments[i]?.disabled) { onChange?.(i); refs.current[i]?.focus(); return; }
    }
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const fwd = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    if (e.key === fwd || e.key === "ArrowDown") { e.preventDefault(); move(selected, 1); }
    else if (e.key === back || e.key === "ArrowUp") { e.preventDefault(); move(selected, -1); }
  };
  return (
    <div
      className="dph-segmented"
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      data-testid={testId}
      style={{ ["--_n" as string]: n, ["--_i" as string]: selected }}
      onKeyDown={onKeyDown}
    >
      {selected >= 0 && selected < n && <span className="dph-segmented__thumb" aria-hidden="true" />}
      {segments.map((s, i) => {
        const on = i === selected;
        const off = disabled || s.disabled;
        return (
          <button
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            className="dph-segmented__segment"
            aria-checked={on}
            aria-label={s.icon ? s.label : undefined}
            tabIndex={on ? 0 : -1}
            disabled={off}
            aria-disabled={off || undefined}
            data-testid={s.testId}
            onClick={() => !on && onChange?.(i)}
          >
            {s.icon ? <Icon name={s.icon} /> : <span className="dph-segmented__label">{s.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
