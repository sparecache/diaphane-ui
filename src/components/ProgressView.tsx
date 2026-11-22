import "./ProgressView.css";

export type ProgressVariant = "circular" | "linear";
export type ProgressSize = "small" | "regular" | "large";
export type ProgressTint = "default" | "accent" | "blue" | "green" | "red" | "orange" | "yellow" | "pink" | "purple" | "gray";

export interface ProgressViewProps {
  /** circular = activity indicator (indeterminate); linear = progress bar. */
  variant?: ProgressVariant;
  /** 0…1 for a determinate linear bar. Omit for indeterminate. */
  value?: number;
  /** Activity indicator size: small/regular are the 20pt medium style, large is 37pt. */
  size?: ProgressSize;
  /** Accessible label. With `showLabel` it is shown: under a spinner, or above a linear bar. */
  label?: string;
  showLabel?: boolean;
  /** Linear only: secondary text under the bar, e.g. "70%" (currentValueLabel). */
  currentValueLabel?: string;
  /** .tint(): spinner default is gray (secondary label); the bar default is the accent color. */
  tint?: ProgressTint;
  testId?: string;
}

const SPOKES = 8;

/** Activity indicator or progress bar. */
export function ProgressView({ variant = "circular", value, size = "regular", label, showLabel, currentValueLabel, tint = "default", testId }: ProgressViewProps) {
  const determinate = typeof value === "number";
  const pct = determinate ? Math.max(0, Math.min(1, value)) : undefined;
  return (
    <span
      className="dph-progress"
      data-variant={variant}
      data-size={size}
      data-tint={tint}
      data-testid={testId}
      role="progressbar"
      aria-label={label}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? 100 : undefined}
      aria-valuenow={pct !== undefined ? Math.round(pct * 100) : undefined}
    >
      {variant === "linear" && showLabel && label && <span className="dph-progress__title">{label}</span>}
      {variant === "circular" ? (
        <span className="dph-progress__spinner" aria-hidden="true">
          {Array.from({ length: SPOKES }, (_, i) => (
            <span key={i} className="dph-progress__spoke" style={{ ["--i" as string]: i }} />
          ))}
        </span>
      ) : (
        <span className="dph-progress__track" aria-hidden="true">
          <span className="dph-progress__bar" data-indeterminate={!determinate || undefined} style={pct !== undefined ? { ["--v" as string]: pct } : undefined} />
        </span>
      )}
      {variant === "circular" && showLabel && label && <span className="dph-progress__label">{label}</span>}
      {variant === "linear" && currentValueLabel && <span className="dph-progress__value">{currentValueLabel}</span>}
    </span>
  );
}
