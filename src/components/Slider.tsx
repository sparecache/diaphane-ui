import type { CSSProperties } from "react";
import { Icon, type IconName } from "./Icon";
import "./FormRow.css";
import "./Slider.css";

export interface SliderProps {
  /** Accessible name (sliders have no visible title). */
  label: string;
  value: number;
  min?: number;
  max?: number;
  /** Snap increment. With `showTicks`, a mark is drawn at every step. */
  step?: number;
  /** Draw tick marks at each step (needs `step`). */
  showTicks?: boolean;
  onChange?: (value: number) => void;
  /** Spoken value, e.g. "40 percent". */
  valueText?: string;
  /** Leading/trailing symbols (minimumValueLabel / maximumValueLabel), e.g. "speaker.fill" / "speaker.wave.3.fill". */
  minIcon?: IconName;
  maxIcon?: IconName;
  disabled?: boolean;
  /** Render as a row inside ListSection (Form). */
  formRow?: boolean;
  testId?: string;
}

const KNOB = 37;

/** Slider: 6pt track, accent fill, 37×24 glass knob. */
export function Slider({
  label, value, min = 0, max = 1, step, showTicks, onChange, valueText, minIcon, maxIcon, disabled, formRow, testId,
}: SliderProps) {
  const span = max - min || 1;
  const p = Math.min(1, Math.max(0, (value - min) / span));
  // The fill ends under the knob's centre; at the extremes it runs to the track ends.
  const fill = p <= 0 ? "0px" : p >= 1 ? "100%" : `calc(${p} * (100% - ${KNOB}px) + ${KNOB / 2}px)`;
  const ticks = showTicks && step && step > 0 ? Math.floor(span / step) + 1 : 0;
  const vars = { ["--_p" as string]: p, ["--_fill" as string]: fill } as CSSProperties;

  const slider = (
    <div className="dph-slider" data-disabled={disabled || undefined} data-testid={formRow ? undefined : testId}>
      {minIcon && <span className="dph-slider__icon" aria-hidden="true"><Icon name={minIcon} /></span>}
      <span className="dph-slider__control" style={vars}>
        <span className="dph-slider__track"><span className="dph-slider__fill" /></span>
        {ticks > 1 && (
          <span className="dph-slider__ticks" aria-hidden="true">
            {Array.from({ length: ticks }, (_, i) => (
              <span key={i} className="dph-slider__tick" style={{ ["--_t" as string]: i / (ticks - 1) } as CSSProperties} />
            ))}
          </span>
        )}
        <span className="dph-slider__knob" />
        <input
          className="dph-slider__input"
          type="range"
          min={min}
          max={max}
          step={step ?? "any"}
          value={value}
          disabled={disabled}
          aria-label={label}
          aria-valuetext={valueText}
          onChange={(e) => onChange?.(Number(e.currentTarget.value))}
        />
      </span>
      {maxIcon && <span className="dph-slider__icon" aria-hidden="true"><Icon name={maxIcon} /></span>}
    </div>
  );
  if (!formRow) return slider;
  return (
    <div className="dph-list-item dph-form-row" role="listitem" data-testid={testId}>
      <div className="dph-list-item__body dph-form-row__body"><span className="dph-form-row__control" data-fill="">{slider}</span></div>
    </div>
  );
}
