import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from "react";
import { Icon, type IconName } from "./Icon";
import "./Overlay.css";
import "./Menu.css";

/** Pull-down panel width (pt), kept in sync with .dph-menu__stack. */
const PANEL_WIDTH = 250;

export interface MenuAction {
  label: string;
  /** Secondary line under the label (footnote, dimmed). */
  subtitle?: string;
  icon?: IconName;
  role?: "default" | "destructive";
  disabled?: boolean;
  /** Toggled state. When any item in the menu defines `checked`, a leading checkmark column is reserved. */
  checked?: boolean;
  /** Submenu (one level). Pressing the item drills in: the parent shrinks and dims and the submenu stacks over it. */
  items?: MenuAction[];
  onPress?: () => void;
}
export interface MenuDivider { divider: true }
/** A titled group; separators are drawn around it automatically. */
export interface MenuSection { section: string; items: MenuAction[] }
export type MenuItem = MenuAction | MenuDivider | MenuSection;
/** Menu layout: large = list; medium = top row of 3 icon + short label items; small = top row of 4 icon-only items. */
export type MenuLayout = "large" | "medium" | "small";

export interface MenuProps {
  /** The control that opens the menu (e.g. a Button). Its own onPress should call onOpenChange(true). */
  trigger: ReactNode;
  /** Actions top to bottom; `{ divider: true }` draws a separator, `{ section, items }` adds a titled group. */
  items: MenuItem[];
  /** "medium" / "small" turn the leading actions (before the first divider or section) into a palette row of 3 / 4. */
  layout?: MenuLayout;
  /** Controlled visibility. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name of the menu. */
  label?: string;
  testId?: string;
}

const isDivider = (i: MenuItem): i is MenuDivider => "divider" in i;
const isSection = (i: MenuItem): i is MenuSection => "section" in i;

type Block =
  | { kind: "palette"; size: "medium" | "small"; items: MenuAction[] }
  | { kind: "group"; title?: string; items: MenuAction[] };

function toBlocks(items: MenuItem[], layout: MenuLayout): Block[] {
  const blocks: Block[] = [];
  let cur: MenuAction[] = [];
  const flush = () => { if (cur.length) blocks.push({ kind: "group", items: cur }); cur = []; };
  for (const it of items) {
    if (isDivider(it)) flush();
    else if (isSection(it)) { flush(); if (it.items.length) blocks.push({ kind: "group", title: it.section, items: it.items }); }
    else cur.push(it);
  }
  flush();
  const first = blocks[0];
  if (layout !== "large" && first?.kind === "group" && !first.title) {
    const n = layout === "medium" ? 3 : 4;
    const rest = first.items.slice(n);
    blocks.splice(0, 1, { kind: "palette", size: layout, items: first.items.slice(0, n) }, ...(rest.length ? [{ kind: "group" as const, items: rest }] : []));
  }
  return blocks;
}

const SUB_SCALE = 0.968; // parent panel scale while a submenu is open (242/250)

export interface MenuPanelProps {
  items: MenuItem[];
  layout?: MenuLayout;
  /** Menu title drawn above the first group (context menus). */
  title?: string;
  label?: string;
  /** Called after an action runs, on Escape and when focus should leave the menu. */
  onDismiss: () => void;
  /** Positioned wrapper of the panel (and of an open submenu). */
  stackRef?: Ref<HTMLDivElement>;
  /** Drawn inside the glass under the content (ContextMenu uses it for the preview's glow). */
  backdrop?: ReactNode;
}

/** The glass menu surface shared by Menu and ContextMenu (not exported from the package). */
export function MenuPanel({ items, layout = "large", title, label, onDismiss, stackRef, backdrop }: MenuPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());
  const [sub, setSub] = useState<{ key: string; item: MenuAction; keyboard: boolean } | null>(null);
  const [subTop, setSubTop] = useState(0);

  useEffect(() => { panelRef.current?.focus({ preventScroll: true }); }, []);

  useLayoutEffect(() => {
    if (!sub) return;
    const row = rowRefs.current.get(sub.key);
    if (row) {
      // The submenu's header row lands on the (scaled) row that opened it.
      const center = (row.offsetTop + row.offsetHeight / 2) * SUB_SCALE;
      const header = subRef.current?.querySelector<HTMLElement>(".dph-menu__item");
      const headerCenter = header ? header.offsetTop + header.offsetHeight / 2 : 31.5;
      setSubTop(center - headerCenter);
    }
    // Keyboard drill-in focuses the first child; a tap only moves focus to the submenu surface (no highlight).
    const first = sub.keyboard ? subRef.current?.querySelector<HTMLElement>("[role^=menuitem]:not(.dph-menu__subheader)") : subRef.current;
    first?.focus({ preventScroll: true });
  }, [sub]);

  const closeSub = () => {
    const key = sub?.key;
    setSub(null);
    if (key) rowRefs.current.get(key)?.focus({ preventScroll: true });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const inSub = !!sub && !!subRef.current?.contains(e.target as Node);
    if (e.key === "Escape" || (inSub && e.key === (getComputedStyle(e.currentTarget).direction === "rtl" ? "ArrowRight" : "ArrowLeft"))) {
      e.stopPropagation(); e.preventDefault();
      if (sub) closeSub(); else onDismiss();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const root = sub ? subRef.current : panelRef.current;
    const els = Array.from(root?.querySelectorAll<HTMLElement>("[role^=menuitem]:not([aria-disabled=true])") ?? []);
    const i = els.indexOf(document.activeElement as HTMLElement);
    els[(i + (e.key === "ArrowDown" ? 1 : -1) + els.length) % els.length]?.focus();
  };

  const run = (a: MenuAction) => { if (a.disabled) return; a.onPress?.(); onDismiss(); };

  const renderItem = (a: MenuAction, key: string, checks: boolean) => (
    <button
      key={key}
      ref={(el) => { if (el) rowRefs.current.set(key, el); else rowRefs.current.delete(key); }}
      type="button"
      role={a.checked !== undefined ? "menuitemcheckbox" : "menuitem"}
      aria-checked={a.checked !== undefined ? a.checked : undefined}
      aria-haspopup={a.items ? "menu" : undefined}
      aria-expanded={a.items ? sub?.key === key : undefined}
      aria-disabled={a.disabled || undefined}
      className="dph-menu__item"
      data-role={a.role === "destructive" ? "destructive" : undefined}
      data-icon={a.icon ? "" : undefined}
      data-checks={checks || undefined}
      onClick={(e) => { if (a.disabled) return; if (a.items) setSub({ key, item: a, keyboard: e.detail === 0 }); else run(a); }}
      onKeyDown={(e) => {
        if (a.items && !a.disabled && e.key === (getComputedStyle(e.currentTarget).direction === "rtl" ? "ArrowLeft" : "ArrowRight")) {
          e.preventDefault(); setSub({ key, item: a, keyboard: true });
        }
      }}
    >
      {checks && <span className="dph-menu__check" aria-hidden="true">{a.checked && <Icon name="checkmark" weight="semibold" />}</span>}
      {a.icon && <span className="dph-menu__icon" aria-hidden="true"><Icon name={a.icon} /></span>}
      <span className="dph-menu__text">
        <span className="dph-menu__label">{a.label}</span>
        {a.subtitle && <span className="dph-menu__subtitle">{a.subtitle}</span>}
      </span>
      {a.items && <span className="dph-menu__chevron" aria-hidden="true"><Icon name="chevron.forward" weight="semibold" /></span>}
    </button>
  );

  const renderBlocks = (blocks: Block[], prefix: string, heading?: string) => {
    const checks = blocks.some((b) => b.kind === "group" && b.items.some((a) => a.checked !== undefined));
    return (
      <>
        {heading && <div className="dph-menu__title" data-checks={checks || undefined}>{heading}</div>}
        {blocks.map((b, bi) => {
          const sep = bi > 0 && <div className="dph-menu__divider" role="separator" />;
          if (b.kind === "palette") {
            return (
              <div key={`${prefix}${bi}`} className="dph-menu__block">
                {sep}
                <div className="dph-menu__palette" data-size={b.size} role="group">
                  {b.items.map((a, i) => (
                    <button
                      key={`${a.label}-${i}`}
                      type="button"
                      role="menuitem"
                      className="dph-menu__cell"
                      aria-label={b.size === "small" ? a.label : undefined}
                      aria-disabled={a.disabled || undefined}
                      data-role={a.role === "destructive" ? "destructive" : undefined}
                      onClick={() => run(a)}
                    >
                      <span className="dph-menu__cell-icon" aria-hidden="true">{a.icon && <Icon name={a.icon} />}</span>
                      {b.size === "medium" && <span className="dph-menu__cell-label">{a.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div key={`${prefix}${bi}`} className="dph-menu__block" role="group" aria-label={b.title}>
              {sep}
              {b.title && <div className="dph-menu__header" data-checks={checks || undefined} aria-hidden="true">{b.title}</div>}
              {b.items.map((a, i) => renderItem(a, `${prefix}${bi}.${i}`, checks))}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div ref={stackRef} className="dph-menu__stack" data-sub={sub ? "" : undefined} onKeyDown={onKeyDown}>
      <div
        ref={panelRef}
        className="dph-menu__panel"
        role="menu"
        aria-label={label ?? title}
        data-level="elevated"
        tabIndex={-1}
        aria-hidden={sub ? true : undefined}
        onClickCapture={sub ? (e) => { e.stopPropagation(); closeSub(); } : undefined}
      >
        {backdrop && <div className="dph-menu__backdrop" aria-hidden="true">{backdrop}</div>}
        {renderBlocks(toBlocks(items, layout), "", title)}
      </div>
      {sub && (
        <div
          ref={subRef}
          className="dph-menu__panel dph-menu__panel--sub"
          role="menu"
          aria-label={sub.item.label}
          data-level="elevated"
          tabIndex={-1}
          style={{ ["--_sub-top" as string]: `${subTop}px` }}
        >
          <button type="button" role="menuitem" aria-expanded="true" className="dph-menu__item dph-menu__subheader" data-icon={sub.item.icon ? "" : undefined} onClick={closeSub}>
            {sub.item.icon && <span className="dph-menu__icon" aria-hidden="true"><Icon name={sub.item.icon} weight="semibold" /></span>}
            <span className="dph-menu__text"><span className="dph-menu__label">{sub.item.label}</span></span>
            <span className="dph-menu__chevron" aria-hidden="true"><Icon name="chevron.down" weight="semibold" /></span>
          </button>
          <div className="dph-menu__divider" role="separator" />
          {(sub.item.items ?? []).map((a, i, all) => renderItem(a, `s.${i}`, all.some((x) => x.checked !== undefined)))}
        </div>
      )}
    </div>
  );
}

/** Pull-down menu: a 250pt glass panel that grows out of its trigger, anchored at the trigger's leading top corner. */
export function Menu({ trigger, items, layout, open, onOpenChange, label, testId }: MenuProps) {
  const root = useRef<HTMLSpanElement>(null);
  const [alignEnd, setAlignEnd] = useState(false);
  // The panel grows from the trigger's leading top corner; when that would run past the screen's trailing edge
  // (a trailing bar button), it hangs from the trigger's trailing corner instead.
  useLayoutEffect(() => {
    const el = root.current;
    if (!open || !el) return;
    const r = el.getBoundingClientRect();
    const host = el.closest(".dph-screen, [data-ds]")?.getBoundingClientRect() ?? new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    const rtl = getComputedStyle(el).direction === "rtl";
    const room = rtl ? r.right - host.left : host.right - r.left;
    setAlignEnd(room < PANEL_WIDTH + 16 && (rtl ? host.right - r.left : r.right - host.left) > room);
  }, [open]);
  return (
    <span ref={root} className="dph-menu" data-open={open || undefined} data-align={alignEnd ? "end" : undefined} data-testid={testId}>
      <span className="dph-menu__trigger">{trigger}</span>
      {open && (
        <>
          <span className="dph-menu__scrim" aria-hidden="true" onClick={() => onOpenChange(false)} />
          <MenuPanel items={items} layout={layout} label={label} onDismiss={() => onOpenChange(false)} />
        </>
      )}
    </span>
  );
}
