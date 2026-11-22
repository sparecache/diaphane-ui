import "./FieldMessage.css";

export type FieldMessagePlacement = "footer" | "inline";

export interface FieldHintProps {
  /** Helper text, e.g. "Use at least 8 characters." */
  text: string;
  /** footer: section-footer style under a Form section. inline: directly under a standalone field. */
  placement?: FieldMessagePlacement;
  /** Lets a field reference this text with aria-describedby. */
  id?: string;
  testId?: string;
}

/** Secondary helper text under a field or a Form section (section-footer style). */
export function FieldHint({ text, placement = "footer", id, testId }: FieldHintProps) {
  return (
    <p className="dph-field-message" data-placement={placement} id={id} data-testid={testId}>
      {text}
    </p>
  );
}
