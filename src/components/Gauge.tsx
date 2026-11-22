import { useId } from "react";
import "./Gauge.css";

export type GaugeVariant = "capacity" | "value";
export type GaugeTint = "default" | "accent" | "success" | "warning" | "danger";

export interface GaugeProps {
  /** Fraction 0…1. */
  value: number;
  /** capacity = closed ring filled clockwise from the top (.accessoryCircularCapacity);
   *  value = open 270° arc with a position marker (.accessoryCircular). */
  variant?: GaugeVariant;
  /** What is measured. Drawn inside the ring (capacity) or in the arc's opening (value). */
  label: string;
  /** Large value text in the center of a value gauge, e.g. "30". */
  currentValueLabel?: string;
  tint?: GaugeTint;
  testId?: string;
}

const D = 58;            // outer diameter (pt)
const W = 5.667;         // stroke width
const R = (D - W) / 2;   // centerline radius
const C = 2 * Math.PI * R;
const SWEEP = 270;       // value gauge: arc from -135° to +135°

/** Circular gauge. */
export function Gauge({ value, variant = "capacity", label, currentValueLabel, tint = "default", testId }: GaugeProps) {
  const maskId = `dph-gauge-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const pct = Math.round(v * 100);
  const angle = ((-SWEEP / 2 + SWEEP * v) * Math.PI) / 180;
  const mx = D / 2 + R * Math.sin(angle);
  const my = D / 2 - R * Math.cos(angle);

  return (
    <span
      className="dph-gauge"
      data-variant={variant}
      data-tint={tint}
      data-testid={testId}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={currentValueLabel}
    >
      <svg className="dph-gauge__ring" viewBox={`0 0 ${D} ${D}`} aria-hidden="true" focusable="false">
        {variant === "capacity" ? (
          <>
            <circle className="dph-gauge__track" cx={D / 2} cy={D / 2} r={R} />
            {v > 0 && (
              <circle
                className="dph-gauge__fill"
                cx={D / 2}
                cy={D / 2}
                r={R}
                strokeDasharray={`${C * v} ${C}`}
                transform={`rotate(-90 ${D / 2} ${D / 2})`}
              />
            )}
          </>
        ) : (
          <>
            <mask id={maskId}>
              <rect width={D} height={D} fill="#fff" />
              <circle cx={mx} cy={my} r={4.5} fill="#000" />
            </mask>
            {/* Mask on an untransformed group so the cut-out sits at the marker, not at the rotated position. */}
            <g mask={`url(#${maskId})`}>
              <circle
                className="dph-gauge__fill"
                cx={D / 2}
                cy={D / 2}
                r={R}
                strokeDasharray={`${(C * SWEEP) / 360} ${C}`}
                transform={`rotate(135 ${D / 2} ${D / 2})`}
              />
            </g>
            <circle className="dph-gauge__marker" cx={mx} cy={my} r={2.7} />
          </>
        )}
      </svg>
      {variant === "capacity" ? (
        <span className="dph-gauge__label" data-center="">{label}</span>
      ) : (
        <>
          {currentValueLabel !== undefined && <span className="dph-gauge__value">{currentValueLabel}</span>}
          <span className="dph-gauge__label" data-bottom="">{label}</span>
        </>
      )}
    </span>
  );
}
