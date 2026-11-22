import type { ReactNode } from "react";
import "./List.css";

export type ListStyle = "insetGrouped" | "grouped" | "plain";

export interface ListProps {
  /**
   * insetGrouped: rounded sections on the grouped background (Settings). grouped: full-width sections on the grouped
   * background with hairlines above and below. plain: full-width rows (feeds, inboxes).
   */
  variant?: ListStyle;
  /** ListSection elements. */
  children: ReactNode;
  /** Accessible name for the list region. */
  label?: string;
  testId?: string;
}

/** Scrolling list container. Children are ListSection; sections hold ListItem. */
export function List({ variant = "insetGrouped", children, label, testId }: ListProps) {
  return (
    <div className="dph-list" data-variant={variant} role="list" aria-label={label} data-testid={testId}>
      {children}
    </div>
  );
}
