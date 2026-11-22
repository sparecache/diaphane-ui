import "./Badge.css";

export type BadgeTone = "red" | "accent" | "gray";

export interface BadgeProps {
  /** Count or short text ("3", "New"). Omit together with `dot`. */
  value?: string | number;
  /** red = notifications, accent = status/new, gray = neutral counts. */
  tone?: BadgeTone;
  /** 10pt dot without text (unread marker). */
  dot?: boolean;
  /** Accessible description, e.g. "3 unread". Defaults to the value; required for `dot`. */
  label?: string;
  testId?: string;
}

/** Capsule count/text badge (caption1 semibold, 20pt tall) or a dot. */
export function Badge({ value, tone = "red", dot, label, testId }: BadgeProps) {
  const isDot = dot || value === undefined;
  const kind = isDot ? "dot" : typeof value === "number" || /^\d+\+?$/.test(String(value)) ? "count" : "text";
  return (
    <span
      className="dph-badge"
      data-kind={kind}
      data-tone={tone}
      data-testid={testId}
      role={isDot || label ? "img" : undefined}
      aria-label={isDot || label ? label : undefined}
      aria-hidden={isDot && !label ? true : undefined}
    >
      {!isDot && <span className="dph-badge__value" aria-hidden={label ? true : undefined}>{value}</span>}
    </span>
  );
}
