import { useId, type CSSProperties } from "react";
import { Icon, type IconName } from "./Icon";
import { FieldHint } from "./FieldHint";
import { FieldError } from "./FieldError";
import "./FormRow.css";
import "./TextField.css";

export type TextFieldVariant = "form" | "roundedBorder" | "plain";
export type TextFieldType = "text" | "email" | "password" | "number" | "tel" | "search";

export interface TextFieldProps {
  /** Accessible name. Visible as the leading label of a form row (LabeledContent) or above a standalone field unless `labelHidden`. */
  label: string;
  /** Keep the label for assistive tech only (the usual form field relies on its placeholder). */
  labelHidden?: boolean;
  /** form: a row inside ListSection. roundedBorder: 34pt bordered box (or the glass capsule for type="search"). plain: bare text. */
  variant?: TextFieldVariant;
  /** Keyboard and semantics. password renders SecureField dots; search adds the magnifying glass. */
  type?: TextFieldType;
  value: string;
  onChange?: (value: string) => void;
  /** Return key pressed (single-line fields). */
  onSubmit?: () => void;
  placeholder?: string;
  /** Grows vertically like TextField(axis: .vertical). */
  multiline?: boolean;
  /** Visible lines for multiline (lineLimit(min...max)). */
  minLines?: number;
  maxLines?: number;
  /** Marks the field invalid (aria-invalid; red border on roundedBorder). Pair with errorText or a FieldError footer. */
  invalid?: boolean;
  /** Red message under the field. */
  errorText?: string;
  /** Helper message under the field. */
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  /** Trailing symbol button, e.g. "mic.fill" in a search field. */
  trailingIcon?: IconName;
  /** Accessible name of the trailing button (required with trailingIcon). */
  trailingIconLabel?: string;
  onTrailingPress?: () => void;
  testId?: string;
}

const inputType: Record<TextFieldType, string> = { text: "text", email: "email", password: "password", number: "text", tel: "tel", search: "search" };
const inputMode: Partial<Record<TextFieldType, "decimal" | "email" | "tel" | "search">> = { number: "decimal", email: "email", tel: "tel", search: "search" };
const LINE = 21.444; // Line advance for 17pt body (3 lines = 64.33pt)

/** Text input: TextField / SecureField / vertical TextField, as a form row or a standalone field. */
export function TextField({
  label, labelHidden, variant = "form", type = "text", value, onChange, onSubmit, placeholder, multiline,
  minLines = 1, maxLines, invalid, errorText, hint, disabled, required, trailingIcon, trailingIconLabel,
  onTrailingPress, testId,
}: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const showLabel = !labelHidden;
  const labeled = variant === "form" && showLabel; // LabeledContent: label leading, value trailing
  const describedBy = [errorText ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  const isMulti = multiline && type !== "password";
  const lines: CSSProperties | undefined = isMulti
    ? ({ ["--_min" as string]: `${minLines * LINE}px`, ["--_max" as string]: maxLines ? `${maxLines * LINE}px` : "none" } as CSSProperties)
    : undefined;

  const common = {
    id,
    className: "dph-text-field__input",
    value,
    placeholder,
    disabled,
    required,
    "aria-required": required || undefined,
    "aria-invalid": invalid || undefined,
    "aria-label": showLabel ? undefined : label,
    "aria-describedby": describedBy,
  };
  const field = isMulti ? (
    <textarea {...common} rows={minLines} style={lines} onChange={(e) => onChange?.(e.currentTarget.value)} />
  ) : (
    <input
      {...common}
      type={inputType[type]}
      inputMode={inputMode[type]}
      autoCapitalize={type === "email" || type === "password" ? "none" : undefined}
      autoCorrect={type === "text" ? undefined : "off"}
      spellCheck={type === "text" ? undefined : false}
      enterKeyHint={type === "search" ? "search" : undefined}
      onChange={(e) => onChange?.(e.currentTarget.value)}
      onKeyDown={onSubmit ? (e) => { if (e.key === "Enter") onSubmit(); } : undefined}
    />
  );

  const box = (
    <span className="dph-text-field__box">
      {type === "search" && <span className="dph-text-field__glyph" aria-hidden="true"><Icon name="magnifyingglass" /></span>}
      {field}
      {trailingIcon && (
        <button type="button" className="dph-text-field__trailing" aria-label={trailingIconLabel} disabled={disabled} onClick={onTrailingPress}>
          <Icon name={trailingIcon} />
        </button>
      )}
    </span>
  );
  const messages = (placement: "inline") => (
    <>
      {errorText && <FieldError text={errorText} id={errorId} placement={placement} />}
      {hint && <FieldHint text={hint} id={hintId} placement={placement} />}
    </>
  );

  const attrs = {
    "data-variant": variant,
    "data-type": type,
    "data-multiline": isMulti || undefined,
    "data-labeled": labeled || undefined,
    "data-invalid": invalid || undefined,
    "data-disabled": disabled || undefined,
    "data-testid": testId,
  };

  if (variant === "form") {
    return (
      <div className="dph-list-item dph-form-row dph-text-field" role="listitem" {...attrs}>
        <div className="dph-list-item__body dph-form-row__body">
          {labeled && <label className="dph-form-row__label" htmlFor={id}>{label}</label>}
          <span className="dph-form-row__control" data-fill="">{box}</span>
          {(errorText || hint) && <span className="dph-form-row__message">{messages("inline")}</span>}
        </div>
      </div>
    );
  }
  return (
    <div className="dph-text-field" {...attrs}>
      {showLabel && <label className="dph-text-field__label" htmlFor={id}>{label}</label>}
      {box}
      {messages("inline")}
    </div>
  );
}
