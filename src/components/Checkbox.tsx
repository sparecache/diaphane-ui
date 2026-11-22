import { useId } from "react";
import { Icon } from "./Icon";
import "./Checkbox.css";

export interface CheckboxProps {
  /** Accessible name; visible next to the circle unless `labelHidden`. */
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  /** Keep the label for VoiceOver only (e.g. a selection circle in a custom row). */
  labelHidden?: boolean;
  disabled?: boolean;
  testId?: string;
}

/** Selection circle (edit-mode List selection) as a standalone checkbox: 22pt ring, or accent fill with a white check. */
export function Checkbox({ label, checked, onChange, labelHidden, disabled, testId }: CheckboxProps) {
  const id = useId();
  return (
    <label className="dph-checkbox" htmlFor={id} data-label-hidden={labelHidden || undefined} data-disabled={disabled || undefined} data-testid={testId}>
      <span className="dph-checkbox__control">
        <input
          id={id}
          className="dph-checkbox__input"
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-disabled={disabled || undefined}
          onChange={(e) => onChange?.(e.currentTarget.checked)}
        />
        <span className="dph-checkbox__circle" data-checked={checked || undefined} aria-hidden="true">
          {checked && <Icon name="checkmark" weight="bold" scale="small" />}
        </span>
      </span>
      <span className="dph-checkbox__label">{label}</span>
    </label>
  );
}
