import "./List.css";
import { useId, type ReactNode } from "react";

export interface ListSectionProps {
  /** Section title above the rows (sentence case). */
  header?: string;
  /** Explanatory text under the rows. */
  footer?: string;
  /** Show the footer as an error (red), e.g. form validation. */
  footerError?: boolean;
  /** ListItem elements. */
  children: ReactNode;
  testId?: string;
}

/** Group of rows with optional header and footer. Use inside List or Form. */
export function ListSection({ header, footer, footerError, children, testId }: ListSectionProps) {
  const headerId = useId();
  return (
    <section className="dph-list-section" aria-labelledby={header ? headerId : undefined} data-testid={testId}>
      {header && <h3 id={headerId} className="dph-list-section__header">{header}</h3>}
      <div className="dph-list-section__rows" role="group">{children}</div>
      {footer && <p className="dph-list-section__footer" data-error={footerError || undefined} role={footerError ? "alert" : undefined}>{footer}</p>}
    </section>
  );
}
