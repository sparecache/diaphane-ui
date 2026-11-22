import { useId } from "react";
import "./SectionHeader.css";

export interface SectionHeaderProps {
  /** Section title in Title Case, e.g. "Highlights". */
  title: string;
  /** Optional trailing action, e.g. "See All" or "Edit". */
  actionLabel?: string;
  onAction?: () => void;
  testId?: string;
}

/**
 * Heading above a group of cards on a card-based screen (dashboard "Highlights", store-style "See All" rows):
 * Title 2 bold with an optional trailing text button. List screens keep ListSection headers instead — use one style
 * per screen, never both.
 */
export function SectionHeader({ title, actionLabel, onAction, testId }: SectionHeaderProps) {
  const id = useId();
  return (
    <div className="dph-section-header" data-testid={testId}>
      <h2 id={id} className="dph-section-header__title">{title}</h2>
      {actionLabel && <button type="button" className="dph-section-header__action" aria-describedby={id} onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}
