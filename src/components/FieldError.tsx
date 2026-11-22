import "./FieldMessage.css";
import type { FieldMessagePlacement } from "./FieldHint";

export interface FieldErrorProps {
  /** Validation message, e.g. "Enter a valid phone number." */
  text: string;
  /** footer: red section footer under a Form section. inline: directly under a standalone field. */
  placement?: FieldMessagePlacement;
  /** Lets a field reference this text with aria-describedby. */
  id?: string;
  testId?: string;
}

/** Red validation text under a field or a Form section; announced to assistive tech when it appears. */
export function FieldError({ text, placement = "footer", id, testId }: FieldErrorProps) {
  return (
    <p className="dph-field-message" data-tone="error" data-placement={placement} id={id} role="alert" data-testid={testId}>
      {text}
    </p>
  );
}
