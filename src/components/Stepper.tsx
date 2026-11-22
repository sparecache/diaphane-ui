import { useId, type KeyboardEvent } from "react";
import "./FormRow.css";
import "./Stepper.css";

export interface StepperProps {
  /** Visible label, e.g. "Quantity: 3" (compose the value into it as mobile apps do). Also the accessible name. */
  label: string;
  /** Hide the label visually (labelsHidden()); it stays the accessible name. */
  labelHidden?: boolean;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  /** Spoken value when the number alone isn't enough, e.g. "3 items". */
  valueText?: string;
  disabled?: boolean;
  /** Render as a row inside ListSection (Form): label leading, stepper trailing. */
  formRow?: boolean;
  testId?: string;
}

/** Stepper: 94×32 capsule with − and + halves split by a hairline. */
export function Stepper({
  label, labelHidden, value, min = -Infinity, max = Infinity, step = 1, onChange, valueText, disabled, formRow, testId,
}: StepperProps) {
  const labelId = useId();
  const canDec = !disabled && value - step >= min - 1e-9;
  const canInc = !disabled && value + step <= max + 1e-9;
  const dec = () => canDec && onChange?.(Math.max(min, value - step));
  const inc = () => canInc && onChange?.(Math.min(max, value + step));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); inc(); }
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); dec(); }
    else if (e.key === "Home" && Number.isFinite(min)) { e.preventDefault(); if (!disabled) onChange?.(min); }
    else if (e.key === "End" && Number.isFinite(max)) { e.preventDefault(); if (!disabled) onChange?.(max); }
  };

  const control = (
    <div
      className="dph-stepper"
      role="spinbutton"
      tabIndex={disabled ? -1 : 0}
      aria-labelledby={labelId}
      aria-valuenow={value}
      aria-valuemin={Number.isFinite(min) ? min : undefined}
      aria-valuemax={Number.isFinite(max) ? max : undefined}
      aria-valuetext={valueText}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      onKeyDown={onKey}
    >
      <button type="button" className="dph-stepper__half" data-op="dec" tabIndex={-1} aria-hidden="true" disabled={!canDec} onClick={dec}>
        <span className="dph-stepper__glyph" />
      </button>
      <span className="dph-stepper__divider" aria-hidden="true" />
      <button type="button" className="dph-stepper__half" data-op="inc" tabIndex={-1} aria-hidden="true" disabled={!canInc} onClick={inc}>
        <span className="dph-stepper__glyph" />
      </button>
    </div>
  );
  const text = <span id={labelId} className={labelHidden ? "dph-visually-hidden" : "dph-form-row__label"}>{label}</span>;

  if (formRow) {
    return (
      <div className="dph-list-item dph-form-row dph-stepper-row" role="listitem" data-testid={testId}>
        <div className="dph-list-item__body dph-form-row__body">{text}<span className="dph-form-row__control">{control}</span></div>
      </div>
    );
  }
  return (
    <div className="dph-stepper-wrap" data-label-hidden={labelHidden || undefined} data-testid={testId}>
      {text}
      {control}
    </div>
  );
}
