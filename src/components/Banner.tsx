import { Icon, type IconName } from "./Icon";
import "./Overlay.css";
import "./Banner.css";

export type BannerTone = "neutral" | "success" | "warning" | "danger";

export interface BannerProps {
  /** Controlled visibility (default true). */
  open?: boolean;
  title: string;
  message?: string;
  /** Icon name; defaults to the tone's symbol (bell / checkmark / exclamation / xmark). */
  icon?: IconName;
  tone?: BannerTone;
  /** Optional trailing button title, e.g. "Undo" or "View" (shown with onAction). */
  actionLabel?: string;
  onAction?: () => void;
  /** Shows a close button and handles Escape. */
  onDismiss?: () => void;
  /** Accessible name of the close button (required to show it). */
  dismissLabel?: string;
  testId?: string;
}

const toneIcon: Record<BannerTone, IconName> = {
  neutral: "bell.fill",
  success: "checkmark.circle.fill",
  warning: "exclamationmark.triangle.fill",
  danger: "xmark.octagon.fill",
};

/** Toast / notification banner: a glass rounded rectangle that drops in under the status bar. */
export function Banner({ open = true, title, message, icon, tone = "neutral", actionLabel, onAction, onDismiss, dismissLabel, testId }: BannerProps) {
  if (!open) return null;
  const urgent = tone === "warning" || tone === "danger";
  return (
    <div className="dph-banner-host" onKeyDown={(e) => { if (e.key === "Escape" && onDismiss) { e.stopPropagation(); onDismiss(); } }}>
      <div className="dph-banner" data-tone={tone} data-level="elevated" role={urgent ? "alert" : "status"} aria-live={urgent ? "assertive" : "polite"} data-testid={testId}>
        <span className="dph-banner__icon" aria-hidden="true"><Icon name={icon ?? toneIcon[tone]} weight="medium" /></span>
        <span className="dph-banner__text">
          <span className="dph-banner__title">{title}</span>
          {message && <span className="dph-banner__message">{message}</span>}
        </span>
        {actionLabel && onAction && <button type="button" className="dph-banner__action" onClick={onAction}>{actionLabel}</button>}
        {onDismiss && dismissLabel && (
          <button type="button" className="dph-banner__close" aria-label={dismissLabel} onClick={onDismiss}>
            <Icon name="xmark" weight="semibold" />
          </button>
        )}
      </div>
    </div>
  );
}
