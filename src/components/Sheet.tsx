import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Icon } from "./Icon";
import { usePresence, EXIT_MS } from "./usePresence";
import "./Overlay.css";
import "./Sheet.css";

export type SheetDetent = "medium" | "large";

export interface SheetProps {
  /** Controlled visibility. */
  open: boolean;
  /** Called on a scrim tap, Escape, or a drag down past the dismiss threshold. */
  onClose: () => void;
  /** Detent the sheet opens at. medium: floating half-height glass sheet; large: full-height card below the status bar. */
  detent?: SheetDetent;
  /** Detents the user can drag between (.presentationDetents). Default: only `detent`. */
  detents?: SheetDetent[];
  /** Called when a drag settles on another detent. */
  onDetentChange?: (detent: SheetDetent) => void;
  /** Drag indicator at the top edge. */
  showGrabber?: boolean;
  /** Inline navigation title. */
  title?: string;
  /** Accessible name of the leading glass xmark button (ToolbarItem(placement: .cancellationAction)); shown when set. */
  cancelLabel?: string;
  onCancel?: () => void;
  /** Accessible name of the trailing prominent checkmark button (.confirmationAction); shown when set. */
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  /** .interactiveDismissDisabled(): the drag snaps back instead of closing (e.g. unsaved changes). */
  dismissDisabled?: boolean;
  /** Called instead of onClose when a dismissal is blocked by dismissDisabled (drag past the threshold, scrim tap,
   *  Escape) — show the "Discard Changes / Keep Editing" action sheet here. */
  onDismissAttempt?: () => void;
  /** Sheet content (List, Form, text…). */
  children: ReactNode;
  testId?: string;
}

/**
 * Modal bottom sheet with an optional inline header.
 * Rises and dismisses on the sheet curve; drag the grabber, header, or content (when scrolled to the top)
 * to move between detents or pull it down to dismiss.
 */
export function Sheet({
  open, onClose, detent = "large", detents, onDetentChange, showGrabber, title, cancelLabel, onCancel, confirmLabel, onConfirm,
  confirmDisabled, dismissDisabled, onDismissAttempt, children, testId,
}: SheetProps) {
  const titleId = useId();
  const ref = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<SheetDetent>(detent);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const { mounted, closing } = usePresence(open, EXIT_MS.sheet);
  const allowed = detents ?? [detent];

  useEffect(() => { if (open) { setCurrent(detent); setDy(0); ref.current?.focus({ preventScroll: true }); } }, [open, detent]);

  if (!mounted) return null;
  const hasHeader = !!(title || cancelLabel || confirmLabel);
  const requestClose = () => (dismissDisabled ? onDismissAttempt?.() : onClose());

  /** Pointer drag. `fromContent` drags only start when the content is scrolled to the top and the finger moves down. */
  const startDrag = (e: ReactPointerEvent, fromContent: boolean) => {
    if (e.button !== 0 || closing) return;
    if ((e.target as HTMLElement).closest("button, input, textarea, select, a, [role=switch], [role=slider]")) return;
    const sheet = ref.current;
    if (!sheet) return;
    const startY = e.clientY;
    const startX = e.clientX;
    let active = !fromContent;
    // The scroller under the finger: the sheet content, or a Screen inside a NavigationStack hosted by the sheet.
    const scroller = (e.target as HTMLElement).closest<HTMLElement>(".dph-screen__scroll") ?? contentRef.current;
    // A pushed page inside the sheet owns its leading edge (swipe back), so the sheet ignores drags that start there.
    const inPushedPage = !!(e.target as HTMLElement).closest('.dph-nav__page[data-role="top"]:not([data-state="root"])');
    if (fromContent && inPushedPage && e.clientX - (sheet.getBoundingClientRect().left) < 32) return;
    let last = { y: startY, t: performance.now() };
    let v = 0;
    const height = sheet.getBoundingClientRect().height;
    const overlayH = (sheet.parentElement?.getBoundingClientRect().height ?? height);
    // How far up the medium sheet can grow (to the large detent's top).
    const growRoom = current === "medium" && allowed.includes("large") ? Math.max(0, sheet.getBoundingClientRect().top - (sheet.parentElement?.getBoundingClientRect().top ?? 0) - 62) : 0;
    const move = (m: PointerEvent) => {
      const d = m.clientY - startY;
      if (!active) {
        if (Math.abs(m.clientX - startX) > Math.abs(d)) { cleanup(); return; }
        if (d > 6 && (scroller?.scrollTop ?? 0) <= 0) { active = true; setDragging(true); } else if (d < -6) { cleanup(); return; } else return;
      }
      if (!dragging) setDragging(true);
      const now = performance.now();
      v = (m.clientY - last.y) / Math.max(1, now - last.t);
      last = { y: m.clientY, t: now };
      // Rubber-band above the top detent; follow the finger down.
      const up = Math.min(0, d);
      const lim = growRoom;
      const resisted = up < -lim ? -lim + (up + lim) * 0.15 : up;
      setDy(d > 0 ? d : resisted);
      m.preventDefault();
    };
    const up = () => {
      cleanup();
      if (!active) return;
      setDragging(false);
      const d = last.y - startY;
      if (d < 0 && growRoom > 0 && (d < -growRoom * 0.25 || v < -0.5)) { setCurrent("large"); setDy(0); onDetentChange?.("large"); return; }
      if (d > 0 && current === "large" && allowed.includes("medium") && d < height * 0.6 && (d > (overlayH * 0.5 - 62) * 0.25 || v > 0.5) && !(v > 1.6)) {
        setCurrent("medium"); setDy(0); onDetentChange?.("medium"); return;
      }
      if (d > 0 && (d > height * 0.35 || v > 0.8)) {
        if (dismissDisabled) { setDy(0); onDismissAttempt?.(); return; }
        setDy(d); onClose(); return;
      }
      setDy(0);
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  return (
    <div
      className="dph-overlay"
      data-kind="sheet"
      data-closing={closing || undefined}
      inert={closing || undefined}
      data-testid={testId}
      onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); requestClose(); } }}
    >
      <div className="dph-overlay__scrim" aria-hidden="true" onClick={requestClose} />
      <section
        ref={ref}
        className="dph-sheet"
        data-detent={current}
        data-dragging={dragging || undefined}
        style={{ ["--_dy" as string]: `${dy}px` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        data-level="elevated"
        tabIndex={-1}
      >
        <div className="dph-sheet__drag" onPointerDown={(e) => startDrag(e, false)}>
          {showGrabber && <div className="dph-sheet__grabber" aria-hidden="true" />}
          {hasHeader && (
            <header className="dph-sheet__header">
              <span className="dph-sheet__slot">
                {cancelLabel && (
                  <button type="button" className="dph-sheet__button" aria-label={cancelLabel} onClick={onCancel}>
                    <Icon name="xmark" scale="large" />
                  </button>
                )}
              </span>
              {title && <h2 id={titleId} className="dph-sheet__title">{title}</h2>}
              <span className="dph-sheet__slot">
                {confirmLabel && (
                  <button type="button" className="dph-sheet__button" data-prominent="" aria-label={confirmLabel} disabled={confirmDisabled} aria-disabled={confirmDisabled || undefined} onClick={onConfirm}>
                    <Icon name="checkmark" scale="large" />
                  </button>
                )}
              </span>
            </header>
          )}
        </div>
        <div className="dph-sheet__content" ref={contentRef} onPointerDown={(e) => startDrag(e, true)}>{children}</div>
      </section>
    </div>
  );
}
