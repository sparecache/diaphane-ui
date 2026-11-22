import { useEffect, useId, useRef } from "react";
import "./Overlay.css";
import "./Alert.css";
import { usePresence, EXIT_MS } from "./usePresence";

export type AlertActionRole = "default" | "cancel" | "destructive";

export interface AlertAction {
  /** Button title. */
  label: string;
  /** cancel is placed leading (2 actions) or last (3+), destructive tints red. */
  role?: AlertActionRole;
  onPress?: () => void;
}

export interface AlertProps {
  /** Controlled visibility. */
  open: boolean;
  /** Called when the alert should close: Escape, or after any action. */
  onClose: () => void;
  title: string;
  message?: string;
  /** Two actions sit side by side as capsules; one or three and more stack vertically. */
  actions: AlertAction[];
  /** Optional single text field (TextField inside .alert): shown when onFieldChange is set. */
  fieldValue?: string;
  fieldPlaceholder?: string;
  /** Accessible name of the field when the placeholder isn't descriptive enough. */
  fieldLabel?: string;
  onFieldChange?: (value: string) => void;
  testId?: string;
}

/** Puts a cancel action by convention: leading in a pair, last in a stack. */
export function orderActions(actions: AlertAction[], stacked: boolean): AlertAction[] {
  const cancel = actions.filter((a) => a.role === "cancel");
  const rest = actions.filter((a) => a.role !== "cancel");
  return stacked ? [...rest, ...cancel] : [...cancel, ...rest];
}

/** Modal alert: left-aligned title and message on a glass card, capsule actions, dimmed backdrop. */
export function Alert({ open, onClose, title, message, actions, fieldValue = "", fieldPlaceholder, fieldLabel, onFieldChange, testId }: AlertProps) {
  const titleId = useId();
  const messageId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);

  const { mounted, closing } = usePresence(open, EXIT_MS.alert);
  useEffect(() => {
    if (!open) return;
    (fieldRef.current ?? cardRef.current)?.focus({ preventScroll: true });
  }, [open]);

  if (!mounted) return null;
  const stacked = actions.length !== 2;
  const ordered = orderActions(actions, stacked);
  const cancel = actions.find((a) => a.role === "cancel");

  return (
    <div
      className="dph-overlay"
      data-kind="alert"
      data-closing={closing || undefined}
      inert={closing || undefined}
      data-testid={testId}
      onKeyDown={(e) => {
        if (e.key === "Escape") { e.stopPropagation(); cancel?.onPress?.(); onClose(); }
      }}
    >
      <div className="dph-overlay__scrim" aria-hidden="true" />
      <div
        ref={cardRef}
        className="dph-alert"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        data-level="elevated"
        tabIndex={-1}
      >
        <div className="dph-alert__header">
          <h2 id={titleId} className="dph-alert__title">{title}</h2>
          {message && <p id={messageId} className="dph-alert__message">{message}</p>}
        </div>
        {onFieldChange && (
          <div className="dph-alert__field">
            <input
              ref={fieldRef}
              className="dph-alert__input"
              type="text"
              value={fieldValue}
              placeholder={fieldPlaceholder}
              aria-label={fieldLabel ?? fieldPlaceholder}
              onChange={(e) => onFieldChange(e.target.value)}
            />
          </div>
        )}
        <div className="dph-alert__actions" data-layout={stacked ? "stack" : "row"}>
          {ordered.map((a, i) => (
            <button
              key={`${a.label}-${i}`}
              type="button"
              className="dph-alert__action"
              data-role={a.role && a.role !== "default" ? a.role : undefined}
              onClick={() => { a.onPress?.(); onClose(); }}
            >
              <span className="dph-alert__action-label">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
