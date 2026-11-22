import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { MenuPanel, type MenuItem, type MenuLayout } from "./Menu";
import "./Overlay.css";
import "./Menu.css";
import "./ContextMenu.css";

export interface ContextMenuProps {
  /** The content that is pressed and lifted as the preview (a photo, a card, a row). */
  children: ReactNode;
  /** Same item model as Menu: actions, `{ divider: true }`, `{ section, items }`, submenus via `items`. */
  items: MenuItem[];
  /** "medium" / "small" turn the leading actions into a palette row of 3 / 4. */
  layout?: MenuLayout;
  /** Controlled visibility. Long press (500ms), right click, the context-menu key or Shift+F10 request opening. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional menu title, drawn above the first group. */
  title?: string;
  /** Accessible name of the target, announced with its menu. */
  label?: string;
  /** Tap action on the target (e.g. open the photo); a long press still opens the menu. Makes the target a button. */
  onPress?: () => void;
  testId?: string;
}

const LIFT = 206 / 180; // preview scale when lifted (a 180pt tile lifts to 206pt)
const GAP = 16; // preview ↔ menu, and the margin kept from the safe area
const LONG_PRESS_MS = 500;

/** Touch-and-hold menu: the target lifts out of a dimmed, blurred background with the menu below it. */
export function ContextMenu({ children, items, layout, open, onOpenChange, title, label, onPress, testId }: ContextMenuProps) {
  const targetRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const press = useRef<{ t: number; x: number; y: number } | null>(null);
  const [pos, setPos] = useState<CSSProperties | null>(null);

  const cancelPress = () => { if (press.current) { clearTimeout(press.current.t); press.current = null; } };
  /** Pointer up before the long-press fired = a tap. */
  const onPointerUp = () => { const tapped = !!press.current; cancelPress(); if (tapped) onPress?.(); };
  useEffect(() => cancelPress, []);

  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    const overlay = overlayRef.current, target = targetRef.current, stack = stackRef.current;
    if (!overlay || !target || !stack) return;
    const o = overlay.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const cs = getComputedStyle(overlay);
    const rtl = cs.direction === "rtl";
    const safeTop = parseFloat(cs.paddingTop) || 0;
    const safeBottom = parseFloat(cs.paddingBottom) || 0;
    const s = Math.min(LIFT, (o.width - 2 * GAP) / Math.max(r.width, 1));
    const w = r.width * s, h = r.height * s;
    const menuW = stack.offsetWidth, menuH = stack.offsetHeight;
    const minTop = safeTop + GAP;
    let top = Math.max(r.top - o.top + r.height / 2 - h / 2, minTop);
    const overflow = top + h + GAP + menuH - (o.height - safeBottom - GAP);
    if (overflow > 0) top = Math.max(top - overflow, minTop);
    // Inline-start offsets, so the same numbers work in RTL.
    const center = rtl ? o.right - (r.left + r.width / 2) : r.left + r.width / 2 - o.left;
    const menuStart = Math.min(Math.max(center - menuW / 2, GAP), o.width - GAP - menuW);
    setPos({
      ["--_px" as string]: `${center - w / 2}px`,
      ["--_py" as string]: `${top}px`,
      ["--_pw" as string]: `${r.width}px`,
      ["--_ph" as string]: `${r.height}px`,
      ["--_ps" as string]: String(s),
      ["--_mx" as string]: `${menuStart}px`,
      ["--_my" as string]: `${top + h + GAP}px`,
      // Preview position seen from inside the menu panel (for the glass glow).
      ["--_gx" as string]: `${center - w / 2 - menuStart}px`,
      ["--_gy" as string]: `${-(h + GAP)}px`,
    });
  }, [open]);

  const onPointerDown = (e: PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cancelPress();
    const t = window.setTimeout(() => { press.current = null; onOpenChange(true); }, LONG_PRESS_MS);
    press.current = { t, x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: PointerEvent<HTMLSpanElement>) => {
    const p = press.current;
    if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 10) cancelPress();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey)) { e.preventDefault(); onOpenChange(true); }
    else if (onPress && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onPress(); }
  };

  return (
    <span className="dph-context-menu" data-open={open || undefined} data-testid={testId}>
      <span
        ref={targetRef}
        className="dph-context-menu__target"
        tabIndex={0}
        role={onPress ? "button" : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={cancelPress}
        onPointerLeave={cancelPress}
        onContextMenu={(e) => { e.preventDefault(); cancelPress(); onOpenChange(true); }}
        onKeyDown={onKeyDown}
      >
        {children}
      </span>
      {open && (
        <div ref={overlayRef} className="dph-overlay dph-context-menu__overlay" data-placed={pos ? "" : undefined} style={pos ?? undefined}>
          <div className="dph-overlay__scrim dph-context-menu__scrim" aria-hidden="true" onClick={() => onOpenChange(false)} />
          <div className="dph-context-menu__preview" aria-hidden="true" onClick={() => onOpenChange(false)}>
            <div className="dph-context-menu__preview-content">{children}</div>
          </div>
          <MenuPanel
            items={items}
            layout={layout}
            title={title}
            label={label ?? title}
            stackRef={stackRef}
            backdrop={<div className="dph-context-menu__glow"><div className="dph-context-menu__preview-content">{children}</div></div>}
            onDismiss={() => { onOpenChange(false); targetRef.current?.focus({ preventScroll: true }); }}
          />
        </div>
      )}
    </span>
  );
}
