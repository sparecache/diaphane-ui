import "./List.css";
import { useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { Toggle } from "./Toggle";

export type ListItemAccessory = "none" | "chevron" | "checkmark" | "toggle" | "info";
export type ListItemRole = "default" | "action" | "destructive";
export type ListItemSwipeEdge = "leading" | "trailing";
export type SwipeActionTone = "destructive" | "accent" | "gray" | "orange" | "blue" | "green" | "yellow" | "purple" | "indigo" | "teal";

/** One swipe action button (.swipeActions { Button }). */
export interface ListItemSwipeAction {
  /** Shown under the icon (or inside the capsule when there is no icon); always the accessible name. */
  label: string;
  /** Icon name, fill variant (e.g. "trash.fill"). */
  icon?: IconName;
  /** Capsule color. destructive = systemRed, accent = the app tint; default gray. */
  tone?: SwipeActionTone;
  onPress: () => void;
  testId?: string;
}

export type ListIconColor = "blue" | "green" | "red" | "orange" | "yellow" | "pink" | "purple" | "indigo" | "teal" | "cyan" | "mint" | "brown" | "gray";

export interface ListItemProps {
  /** Primary text. */
  title: string;
  /** Second line in secondary color. */
  subtitle?: string;
  /** center (default): value centred at the trailing edge. top: value sits on the title line and the subtitle runs the
   *  full width below it (inbox and message lists) — use for rows with a long subtitle and a date/time value. */
  valueAlignment?: "center" | "top";
  /** Control or content under the title, inside the row: a Slider, or input Rating stars. With valueAlignment "top"
   *  the value stays on the title line. */
  detail?: ReactNode;
  /** Trailing value (LabeledContent), e.g. "English". */
  value?: string;
  /** Leading icon. With `iconColor` it sits in a 30pt rounded tile (settings style). */
  icon?: IconName;
  iconColor?: ListIconColor;
  /** Leading content in place of an icon, e.g. an Avatar (separator then starts at the text). */
  leading?: ReactNode;
  /** Prominent summary row (Mail/Messages): headline title and subheadline trailing value. */
  prominent?: boolean;
  /** Trailing unread-style count bubble (red filled pill, white digits): `badge={3}`. A count of 0 or an empty value shows
   *  nothing; any other text ("Home") shows as a plain trailing value. With valueAlignment "top" the time sits on the
   *  title line and the bubble right under it in one trailing column; pass 0 on read rows to keep every row aligned. */
  badge?: string | number;
  /** Trailing control or indicator. `chevron` = NavigationLink. */
  accessory?: ListItemAccessory;
  /** For accessory="toggle". */
  toggled?: boolean;
  onToggle?: (on: boolean) => void;
  /** Edit-mode selection: shows the leading selection circle. */
  selectable?: boolean;
  selected?: boolean;
  /** action = accent-tinted button row; destructive = red button row. */
  role?: ListItemRole;
  disabled?: boolean;
  onPress?: () => void;
  /** Swipe actions revealed by dragging the row toward the leading side (first = outermost, at the edge). */
  trailingActions?: ListItemSwipeAction[];
  /** Swipe actions revealed by dragging the row toward the trailing side (first = outermost, at the edge). */
  leadingActions?: ListItemSwipeAction[];
  /** Which actions are open. Pass it to render the open state; the row also opens and closes itself on swipe. */
  swiped?: ListItemSwipeEdge;
  /** Called when the row opens or closes its actions (undefined = closed). */
  onSwipeChange?: (edge: ListItemSwipeEdge | undefined) => void;
  testId?: string;
}

/* Swipe actions: 60pt capsules, 10pt apart and 10pt from the row edge. */
const ACTION_W = 60;
const ACTION_GAP = 10;
const reveal = (n: number) => n * (ACTION_W + ACTION_GAP) + ACTION_GAP;

/** Horizontal swipe (pointer and touch) that slides the row body over its actions. Offsets are logical (+ = toward trailing). */
function useSwipe(leading: number, trailing: number, swiped: ListItemSwipeEdge | undefined, onChange?: (e: ListItemSwipeEdge | undefined) => void) {
  const [open, setOpen] = useState<ListItemSwipeEdge | undefined>(swiped);
  const [drag, setDrag] = useState<number | null>(null);
  const start = useRef<{ x: number; y: number; base: number; dir: number; active: boolean; id: number } | null>(null);
  const moved = useRef(false);
  const id = useId();
  const change = useRef(onChange);
  change.current = onChange;
  useEffect(() => setOpen(swiped), [swiped]);
  // Opening one row closes any other open row.
  useEffect(() => {
    if (!open) return;
    const other = (ev: Event) => {
      if ((ev as CustomEvent<string>).detail === id) return;
      setOpen(undefined);
      change.current?.(undefined);
    };
    document.addEventListener("diaphane-swipe-open", other);
    return () => document.removeEventListener("diaphane-swipe-open", other);
  }, [open, id]);

  const rest = open === "trailing" ? -reveal(trailing) : open === "leading" ? reveal(leading) : 0;
  const set = (e: ListItemSwipeEdge | undefined) => {
    setOpen(e);
    if (e) document.dispatchEvent(new CustomEvent("diaphane-swipe-open", { detail: id }));
    if (e !== open) onChange?.(e);
  };

  const onPointerDown = (ev: ReactPointerEvent<HTMLElement>) => {
    if (!leading && !trailing) return;
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    if ((ev.target as HTMLElement).closest(".dph-list-item__actions")) return;
    const dir = getComputedStyle(ev.currentTarget).direction === "rtl" ? -1 : 1;
    start.current = { x: ev.clientX, y: ev.clientY, base: rest, dir, active: false, id: ev.pointerId };
    moved.current = false;
  };
  const onPointerMove = (ev: ReactPointerEvent<HTMLElement>) => {
    const s = start.current;
    if (!s || s.id !== ev.pointerId) return;
    const dx = (ev.clientX - s.x) * s.dir;
    const dy = ev.clientY - s.y;
    if (!s.active) {
      if (Math.abs(dx) < 8) { if (Math.abs(dy) > 8) start.current = null; return; }
      if (Math.abs(dy) > Math.abs(dx)) { start.current = null; return; }
      s.active = true;
      moved.current = true;
      ev.currentTarget.setPointerCapture(ev.pointerId);
    }
    let x = s.base + dx;
    const max = leading ? reveal(leading) : 0;
    const min = trailing ? -reveal(trailing) : 0;
    // Rubber band past the fully revealed width.
    if (x > max) x = max + (x - max) / 3;
    if (x < min) x = min + (x - min) / 3;
    setDrag(x);
  };
  const onPointerUp = (ev: ReactPointerEvent<HTMLElement>) => {
    const s = start.current;
    start.current = null;
    if (!s || !s.active || drag === null) { setDrag(null); return; }
    ev.currentTarget.releasePointerCapture?.(ev.pointerId);
    const x = drag;
    setDrag(null);
    if (trailing && x < -reveal(trailing) / 2) set("trailing");
    else if (leading && x > reveal(leading) / 2) set("leading");
    else set(undefined);
  };
  /** Swallows the click that ends a drag, and closes an open row when its body is tapped. */
  const onClickCapture = (ev: ReactMouseEvent<HTMLElement>) => {
    if ((ev.target as HTMLElement).closest(".dph-list-item__actions")) return;
    if (moved.current) { ev.preventDefault(); ev.stopPropagation(); moved.current = false; return; }
    if (open) { ev.preventDefault(); ev.stopPropagation(); set(undefined); }
  };
  return { open, offset: drag ?? rest, dragging: drag !== null, set, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onClickCapture } };
}

function SwipeActions({ edge, actions, onDone, onFocus }: { edge: ListItemSwipeEdge; actions: ListItemSwipeAction[]; onDone: () => void; onFocus: () => void }) {
  return (
    <div className="dph-list-item__actions" data-edge={edge} onFocus={onFocus}>
      {actions.map((a, i) => (
        <button
          key={i}
          type="button"
          className="dph-list-item__action"
          data-tone={a.tone ?? "gray"}
          data-icon={a.icon ? "" : undefined}
          aria-label={a.label}
          data-testid={a.testId}
          onClick={() => { a.onPress(); onDone(); }}
        >
          <span className="dph-list-item__action-shape" aria-hidden="true">
            {a.icon ? <Icon name={a.icon} weight="medium" /> : a.label}
          </span>
          {a.icon && <span className="dph-list-item__action-label" aria-hidden="true">{a.label}</span>}
        </button>
      ))}
    </div>
  );
}

/** A badge that is a count (3, "12", "99+") draws as a bubble; other text stays a plain value. Zero and empty draw nothing. */
const isCount = (b: string | number | undefined) => typeof b === "number" || (typeof b === "string" && /^\d+\+?$/.test(b));
const isZero = (b: string | number | undefined) => b === undefined || b === "" || (isCount(b) && Number.parseInt(String(b), 10) === 0);

/** One row of a List section: title, optional subtitle/value/icon, and a trailing accessory. */
export function ListItem({
  title, subtitle, value, valueAlignment = "center", detail, icon, iconColor, leading, prominent, badge, accessory = "none", toggled = false, onToggle,
  selectable, selected, role = "default", disabled, onPress, trailingActions, leadingActions, swiped, onSwipeChange, testId,
}: ListItemProps) {
  const interactive = !!onPress || accessory === "chevron" || role !== "default" || selectable;
  const Tag = interactive && accessory !== "toggle" ? "button" : "div";
  const nLead = leadingActions?.length ?? 0;
  const nTrail = trailingActions?.length ?? 0;
  const swipe = useSwipe(nLead, nTrail, swiped, onSwipeChange);
  const hasActions = nLead + nTrail > 0;
  const bubble = isCount(badge) && !isZero(badge) ? <span className="dph-list-item__badge">{badge}</span> : null;
  const textBadge = badge !== undefined && !isCount(badge) && badge !== "" ? <span className="dph-list-item__value" data-badge="">{badge}</span> : null;
  // Message-style rows (value on top + a count badge prop): time and bubble share one trailing column.
  const stacked = valueAlignment === "top" && !!(subtitle || detail) && badge !== undefined && isCount(badge);
  return (
    <div
      className="dph-list-item"
      role="listitem"
      data-prominent={prominent || undefined}
      data-role={role === "default" ? undefined : role}
      data-disabled={disabled || undefined}
      data-swipe={hasActions ? (swipe.open ?? (swipe.offset !== 0 ? "dragging" : "closed")) : undefined}
      data-dragging={swipe.dragging || undefined}
      data-testid={testId}
      style={hasActions ? { ["--_x" as string]: `${swipe.offset}px` } : undefined}
      onKeyDown={hasActions ? (e) => { if (e.key === "Escape" && swipe.open) swipe.set(undefined); } : undefined}
      {...(hasActions ? swipe.handlers : {})}
    >
      {nTrail > 0 && <SwipeActions edge="trailing" actions={trailingActions!} onDone={() => swipe.set(undefined)} onFocus={() => swipe.open !== "trailing" && swipe.set("trailing")} />}
      {nLead > 0 && <SwipeActions edge="leading" actions={leadingActions!} onDone={() => swipe.set(undefined)} onFocus={() => swipe.open !== "leading" && swipe.set("leading")} />}
      <Tag
        className="dph-list-item__body"
        {...(Tag === "button" ? { type: "button" as const, disabled, onClick: onPress, "aria-pressed": selectable ? !!selected : undefined } : {})}
        aria-disabled={disabled || undefined}
      >
        {selectable && (
          <span className="dph-list-item__select" data-selected={selected || undefined} aria-hidden="true">
            {selected && <Icon name="checkmark" weight="bold" scale="small" />}
          </span>
        )}
        {icon && (
          <span className="dph-list-item__icon" data-tile={iconColor} aria-hidden="true">
            <Icon name={icon} weight={iconColor ? "medium" : "regular"} scale={iconColor ? "large" : "medium"} />
          </span>
        )}
        {leading && <span className="dph-list-item__leading">{leading}</span>}
        <span className="dph-list-item__text" data-stacked={stacked || undefined}>
          {valueAlignment === "top" && (subtitle || detail) && value !== undefined && !stacked ? (
            <span className="dph-list-item__title-row">
              <span className="dph-list-item__title">{title}</span>
              <span className="dph-list-item__value" data-inline="">{value}</span>
            </span>
          ) : <span className="dph-list-item__title">{title}</span>}
          {stacked && value !== undefined && <span className="dph-list-item__value" data-inline="" data-stacked="">{value}</span>}
          {subtitle && <span className="dph-list-item__subtitle">{subtitle}</span>}
          {stacked && bubble}
          {detail && <span className="dph-list-item__detail">{detail}</span>}
        </span>
        {!stacked && value !== undefined && !(valueAlignment === "top" && (subtitle || detail)) && <span className="dph-list-item__value">{value}</span>}
        {!stacked && textBadge}
        {!stacked && bubble}
        {accessory === "chevron" && <span className="dph-list-item__chevron" aria-hidden="true"><Icon name="chevron.forward" weight="semibold" /></span>}
        {accessory === "checkmark" && selected !== false && <span className="dph-list-item__check"><Icon name="checkmark" weight="semibold" label="Selected" /></span>}
        {accessory === "info" && <span className="dph-list-item__info"><Icon name="info.circle" label="More info" /></span>}
        {accessory === "toggle" && <Toggle label={title} labelHidden checked={toggled} onChange={onToggle} disabled={disabled} />}
      </Tag>
    </div>
  );
}
