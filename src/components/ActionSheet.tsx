import { useEffect, useId, useRef } from "react";
import type { AlertAction } from "./Alert";
import "./Overlay.css";
import "./Alert.css";
import "./ActionSheet.css";
import { usePresence, EXIT_MS } from "./usePresence";

export interface ActionSheetProps {
  /** Controlled visibility. */
  open: boolean;
  /** Called when the dialog should close: outside tap, Escape, or after any action. */
  onClose: () => void;
  title?: string;
  message?: string;
  /** Choices, top to bottom. A `cancel` action is not drawn (it dismisses by tapping outside) but stays reachable for assistive tech. */
  actions: AlertAction[];
  /** Label of the cancel affordance announced to assistive tech when `actions` has no cancel role. */
  cancelLabel?: string;
  testId?: string;
}

/** Confirmation dialog: a glass popover of stacked capsule choices, no dimming. */
export function ActionSheet({ open, onClose, title, message, actions, cancelLabel, testId }: ActionSheetProps) {
  const titleId = useId();
  const messageId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const { mounted, closing } = usePresence(open, EXIT_MS.popover);
  useEffect(() => { if (open) cardRef.current?.focus({ preventScroll: true }); }, [open]);
  if (!mounted) return null;

  const cancel = actions.find((a) => a.role === "cancel");
  const visible = actions.filter((a) => a.role !== "cancel");
  const dismiss = () => { cancel?.onPress?.(); onClose(); };
  const dismissLabel = cancel?.label ?? cancelLabel;

  return (
    <div
      className="dph-overlay"
      data-closing={closing || undefined}
      inert={closing || undefined}
      data-kind="popover"
      data-testid={testId}
      onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); dismiss(); } }}
    >
      <div className="dph-overlay__scrim" aria-hidden="true" onClick={dismiss} />
      <div
        ref={cardRef}
        className="dph-alert dph-action-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={message ? messageId : undefined}
        data-level="elevated"
        tabIndex={-1}
      >
        {(title || message) && (
          <div className="dph-alert__header">
            {title && <h2 id={titleId} className="dph-alert__title">{title}</h2>}
            {message && <p id={messageId} className="dph-alert__message">{message}</p>}
          </div>
        )}
        <div className="dph-alert__actions" data-layout="stack">
          {visible.map((a, i) => (
            <button
              key={`${a.label}-${i}`}
              type="button"
              className="dph-alert__action"
              data-role={a.role === "destructive" ? "destructive" : undefined}
              onClick={() => { a.onPress?.(); onClose(); }}
            >
              <span className="dph-alert__action-label">{a.label}</span>
            </button>
          ))}
          {dismissLabel && <button type="button" className="dph-action-sheet__cancel" onClick={dismiss}>{dismissLabel}</button>}
        </div>
      </div>
    </div>
  );
}
