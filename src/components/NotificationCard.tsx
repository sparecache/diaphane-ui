import { Icon, type IconName } from "./Icon";
import type { ChartTint } from "./Chart";
import "./NotificationCard.css";

export interface NotificationCardProps {
  /** Small caps header with a hairline under it (e.g. "NOTIFICATIONS"). Omit for a promo card (close button top-trailing). */
  label?: string;
  /** Main text, semibold. */
  title: string;
  /** Secondary text under the title. */
  message?: string;
  /** Symbol in a tinted circle (header style) or a large tinted glyph (promo style). */
  icon?: IconName;
  tint?: ChartTint;
  /** Tinted capsule action under the text, e.g. "Open Settings". */
  actionLabel?: string;
  onAction?: () => void;
  /** Shows the grey close button. */
  onDismiss?: () => void;
  /** Accessible name of the close button. */
  dismissLabel?: string;
  testId?: string;
}

/**
 * Inline notice / suggestion card on a grouped Screen, with a "Notifications"-style header or a promo layout (30pt tinted capsule action, 20pt grey close circle).
 */
export function NotificationCard({ label, title, message, icon, tint = "accent", actionLabel, onAction, onDismiss, dismissLabel, testId }: NotificationCardProps) {
  const close = onDismiss && (
    <button type="button" className="dph-notice__close" aria-label={dismissLabel} onClick={onDismiss}>
      <Icon name="xmark" weight="bold" scale="small" />
    </button>
  );
  return (
    <section className="dph-notice" data-tint={tint} data-variant={label ? "header" : "promo"} data-testid={testId}>
      {label && (
        <header className="dph-notice__header">
          <span className="dph-notice__label">{label}</span>
          {close}
        </header>
      )}
      <div className="dph-notice__body">
        {icon && <span className="dph-notice__icon" aria-hidden="true"><Icon name={icon} weight="semibold" /></span>}
        <div className="dph-notice__text">
          <p className="dph-notice__title">{title}</p>
          {message && <p className="dph-notice__message">{message}</p>}
          {actionLabel && <button type="button" className="dph-notice__action" onClick={onAction}>{actionLabel}</button>}
        </div>
        {!label && close}
      </div>
    </section>
  );
}
