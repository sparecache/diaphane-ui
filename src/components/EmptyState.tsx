import { Button, type ButtonProps } from "./Button";
import { Icon, type IconName } from "./Icon";
import "./EmptyState.css";

export type EmptyStateVariant = "default" | "search";
export type EmptyStateAction = Omit<ButtonProps, "size" | "testId">;

export interface EmptyStateProps {
  /** default: icon + title + description (+ actions). search: magnifying glass with the title built from `query`. */
  variant?: EmptyStateVariant;
  /** Icon above the title (default variant). */
  icon?: IconName;
  /** Headline. For variant="search", pass the localized "No Results for “%@”" form; `{query}` is replaced by `query`. */
  title: string;
  description?: string;
  /** The search text shown in the title of the search variant. */
  query?: string;
  /** Up to two buttons under the description (small controls, borderedProminent by default). */
  actions?: EmptyStateAction[];
  testId?: string;
}

/** Content-unavailable placeholder, centered in its container. */
export function EmptyState({ variant = "default", icon, title, description, query, actions, testId }: EmptyStateProps) {
  const symbol = variant === "search" ? "magnifyingglass" : icon;
  const heading = query !== undefined ? title.replace("{query}", query) : title;
  return (
    <div className="dph-empty" data-variant={variant} data-testid={testId} role={variant === "search" ? "status" : undefined}>
      {symbol && <span className="dph-empty__icon" aria-hidden="true"><Icon name={symbol} weight="medium" /></span>}
      <h2 className="dph-empty__title">{heading}</h2>
      {description && <p className="dph-empty__description">{description}</p>}
      {actions && actions.length > 0 && (
        <div className="dph-empty__actions">
          {actions.map((a, i) => <Button key={`${a.label}-${i}`} size="small" {...a} />)}
        </div>
      )}
    </div>
  );
}
