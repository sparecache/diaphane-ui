import { useId } from "react";
import "./Toggle.css";

export interface ToggleProps {
  /** Visible label. Set `labelHidden` to keep it for VoiceOver only (e.g. inside a ListItem). */
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  labelHidden?: boolean;
  disabled?: boolean;
  /** On-state tint. Default is green; `accent` follows the brand color. */
  tint?: "green" | "accent";
  testId?: string;
}

/** Switch (63×28pt with a liquid-lens knob). */
export function Toggle({ label, checked, onChange, labelHidden, disabled, tint = "green", testId }: ToggleProps) {
  const id = useId();
  return (
    <label className="dph-toggle" data-label-hidden={labelHidden || undefined} data-disabled={disabled || undefined} htmlFor={id} data-testid={testId}>
      <span className="dph-toggle__label">{label}</span>
      <input
        id={id}
        className="dph-toggle__input"
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        aria-checked={checked}
        data-tint={tint}
        onChange={(e) => onChange?.(e.currentTarget.checked)}
      />
    </label>
  );
}
