import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import "./BarActions.css";
import "./SearchField.css";

export type SearchFieldPlacement = "bottomBar" | "inline";

export interface SearchFieldProps {
  value: string;
  /** Prompt shown while empty (also the accessible name unless `label` is set). */
  placeholder: string;
  onChange?: (value: string) => void;
  /** Return key / search button. */
  onSubmit?: (value: string) => void;
  /** Shows a glass close button beside the field while it is focused or filled (dismisses search). */
  onCancel?: () => void;
  /** Dictation button inside the field while it is empty. */
  onMic?: () => void;
  /** Accessible name of the field; defaults to the placeholder. */
  label?: string;
  /** Accessible names of the icon buttons. */
  clearLabel?: string;
  cancelLabel?: string;
  micLabel?: string;
  /** bottomBar: a search bar for phones, floating 28pt above the screen edge (Screen's bottomBar slot). inline: just the field. */
  placement?: SearchFieldPlacement;
  disabled?: boolean;
  testId?: string;
}

/** Search field: 48pt glass capsule with magnifyingglass, prompt, mic and clear buttons. */
export function SearchField({
  value, placeholder, onChange, onSubmit, onCancel, onMic, label, clearLabel, cancelLabel, micLabel,
  placement = "bottomBar", disabled, testId,
}: SearchFieldProps) {
  const [focused, setFocused] = useState(false);
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit?.(value); };
  const showCancel = !!onCancel && (focused || value !== "");
  return (
    <form className="dph-search" role="search" data-placement={placement} data-testid={testId} onSubmit={submit} aria-disabled={disabled || undefined}>
      <label className="dph-bar-glass dph-search__field">
        <span className="dph-search__glass-icon" aria-hidden="true"><Icon name="magnifyingglass" weight="medium" /></span>
        <input
          className="dph-search__input"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          aria-label={label ?? placeholder}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {value !== "" ? (
          <button type="button" className="dph-search__accessory" aria-label={clearLabel} disabled={disabled} onClick={() => onChange?.("")}>
            <Icon name="xmark.circle.fill" />
          </button>
        ) : onMic ? (
          <button type="button" className="dph-search__accessory" data-kind="mic" aria-label={micLabel} disabled={disabled} onClick={onMic}>
            <Icon name="mic.fill" />
          </button>
        ) : null}
      </label>
      {showCancel && (
        <button type="button" className="dph-bar-glass dph-search__cancel" aria-label={cancelLabel} onMouseDown={(e) => e.preventDefault()} onClick={onCancel}>
          <Icon name="xmark" scale="large" />
        </button>
      )}
    </form>
  );
}
