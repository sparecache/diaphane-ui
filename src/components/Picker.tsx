import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "./Icon";
import { SegmentedControl } from "./SegmentedControl";
import { Wheel } from "./Wheel";
import "./List.css";
import "./FormRow.css";
import "./Picker.css";

export type PickerVariant = "menu" | "inline" | "segmented" | "wheel" | "navigationLink";

export interface PickerOption {
  value: string;
  /** Visible option title. */
  label: string;
  disabled?: boolean;
}

/** One component of a multi-column wheel. */
export interface PickerColumn {
  /** Accessible name of the column. */
  label: string;
  options: PickerOption[];
  /** Selected option value in this column. */
  value: string;
}

export interface PickerProps {
  /** Visible row label (menu) and accessible name of the group. */
  label: string;
  /** Hide the label visually (labelsHidden()); it stays the accessible name. */
  labelHidden?: boolean;
  options: PickerOption[];
  /** Selected option value. */
  value: string;
  onChange?: (value: string) => void;
  /**
   * menu: label + current value (secondary) + chevron.up.chevron.down; tapping opens a menu.
   * inline: one checkmark row per option (Form). segmented: a segmented control.
   * wheel: spinning wheel.
   * navigationLink: a Form row with the value and a chevron; tapping calls onNavigate (the app pushes the option list).
   */
  variant?: PickerVariant;
  /** wheel only: several columns side by side. Replaces options/value. */
  columns?: PickerColumn[];
  /** wheel with columns: called with the column index and its new value. */
  onColumnChange?: (column: number, value: string) => void;
  /** navigationLink: the row was tapped; show the options on a pushed screen. */
  onNavigate?: () => void;
  disabled?: boolean;
  /** Render as row(s) inside ListSection (Form). */
  formRow?: boolean;
  testId?: string;
}

/** Picker in its menu, inline, segmented, wheel and navigationLink styles. */
export function Picker({ label, labelHidden, options, value, onChange, variant = "menu", columns, onColumnChange, onNavigate, disabled, formRow, testId }: PickerProps) {
  if (variant === "wheel") return <WheelPicker {...{ label, options, value, onChange, columns, onColumnChange, disabled, formRow, testId }} />;
  if (variant === "navigationLink") return <NavigationLinkPicker {...{ label, options, value, onNavigate, disabled, testId }} />;
  if (variant === "inline") return <InlinePicker {...{ label, options, value, onChange, disabled, formRow, testId }} />;
  if (variant === "segmented") return <SegmentedPicker {...{ label, options, value, onChange, disabled, formRow, testId }} />;
  return <MenuPicker {...{ label, labelHidden, options, value, onChange, disabled, formRow, testId }} />;
}

type Inner = Omit<PickerProps, "variant">;

/** Wheel style. One column = a single wheel (30pt rows, 21pt text); `columns` = multi-component pickers (32pt rows, 23.5pt band text). */
function WheelPicker({ label, options, value, onChange, columns, onColumnChange, disabled, formRow, testId }: Inner) {
  const multi = !!columns?.length;
  const cols = multi ? columns! : [{ label, options, value }];
  const wheel = (
    <Wheel
      metrics={multi ? "multi" : "single"}
      label={label}
      disabled={disabled}
      testId={formRow ? undefined : testId}
      columns={cols.map((c, ci) => ({
        id: String(ci),
        label: c.label,
        count: c.options.length,
        selected: Math.max(0, c.options.findIndex((o) => o.value === c.value)),
        render: (i) => c.options[i]?.label,
        text: (i) => c.options[i]?.label ?? "",
      }))}
      onSelect={(ci, i) => {
        const o = cols[ci]?.options[i];
        if (!o || o.disabled) return;
        if (multi) onColumnChange?.(ci, o.value);
        else onChange?.(o.value);
      }}
    />
  );
  if (!formRow) return wheel;
  return (
    <div className="dph-list-item dph-form-row dph-picker-wheel-row" role="listitem" data-testid={testId}>
      <div className="dph-list-item__body dph-form-row__body"><span className="dph-form-row__control" data-fill="">{wheel}</span></div>
    </div>
  );
}

/** navigationLink style: label, current value (secondary) and a chevron, like ListItem accessory="chevron". */
function NavigationLinkPicker({ label, options, value, onNavigate, disabled, testId }: Inner) {
  const current = options.find((o) => o.value === value);
  return (
    <div className="dph-list-item dph-picker-link" role="listitem" data-disabled={disabled || undefined} data-testid={testId}>
      <button type="button" className="dph-list-item__body" disabled={disabled} onClick={onNavigate} aria-haspopup="listbox">
        <span className="dph-list-item__text"><span className="dph-list-item__title">{label}</span></span>
        {current && <span className="dph-list-item__value">{current.label}</span>}
        <span className="dph-list-item__chevron" aria-hidden="true"><Icon name="chevron.forward" weight="semibold" /></span>
      </button>
    </div>
  );
}

function MenuPicker({ label, labelHidden, options, value, onChange, disabled, formRow, testId }: Inner) {
  const [open, setOpen] = useState(false);
  const labelId = useId();
  const menuId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    // Show in the top layer so the List section's rounded clip can't cut the menu off; anchor under the button's trailing edge.
    const pop = popRef.current;
    const btn = buttonRef.current;
    if (pop && btn) {
      const r = btn.getBoundingClientRect();
      const rtl = getComputedStyle(btn).direction === "rtl";
      pop.style.setProperty("--_top", `${r.bottom + 6}px`);
      pop.style.setProperty("--_end", `${rtl ? r.left : document.documentElement.clientWidth - r.right}px`);
      if (typeof pop.showPopover === "function" && !pop.matches(":popover-open")) pop.showPopover();
    }
    const away = (e: PointerEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", away);
    // Focus the selected option (or the first) when the menu opens.
    const el = rootRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]') ?? rootRef.current?.querySelector<HTMLButtonElement>("[role=menuitemradio]");
    el?.focus();
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const choose = (v: string) => { setOpen(false); buttonRef.current?.focus(); if (v !== value) onChange?.(v); };
  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=menuitemradio]:not(:disabled)")];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); buttonRef.current?.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
  };

  const control = (
    <span className="dph-picker-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="dph-picker-menu__button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-labelledby={`${labelId} ${labelId}-v`}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span id={`${labelId}-v`} className="dph-picker-menu__value">{current?.label}</span>
        <span className="dph-picker-menu__chevron" aria-hidden="true"><Icon name="chevron.up.chevron.down" scale="small" weight="medium" /></span>
      </button>
      {open && (
        // Simple popover stand-in for a system menu (glass panel, checkmark on the current option).
        <div ref={popRef} popover="manual" id={menuId} className="dph-picker-menu__popover" role="menu" aria-labelledby={labelId} data-level="elevated" onKeyDown={onMenuKey}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitemradio"
              aria-checked={o.value === value}
              className="dph-picker-menu__item"
              disabled={o.disabled}
              onClick={() => choose(o.value)}
            >
              <span className="dph-picker-menu__check" aria-hidden="true">{o.value === value && <Icon name="checkmark" weight="semibold" />}</span>
              <span className="dph-picker-menu__item-label">{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </span>
  );
  const text = <span id={labelId} className={labelHidden ? "dph-visually-hidden" : "dph-form-row__label"}>{label}</span>;

  if (formRow) {
    return (
      <div className="dph-list-item dph-form-row dph-picker-row" role="listitem" data-disabled={disabled || undefined} data-testid={testId}>
        <div className="dph-list-item__body dph-form-row__body">{text}<span className="dph-form-row__control">{control}</span></div>
      </div>
    );
  }
  return <div className="dph-picker" data-variant="menu" data-disabled={disabled || undefined} data-testid={testId}>{text}{control}</div>;
}

function InlinePicker({ label, options, value, onChange, disabled, formRow, testId }: Inner) {
  const rows = options.map((o) => {
    const on = o.value === value;
    const off = disabled || o.disabled;
    return (
      <div key={o.value} className="dph-list-item dph-form-row dph-picker-option" role="presentation">
        <button
          type="button"
          role="radio"
          aria-checked={on}
          className="dph-list-item__body dph-form-row__body"
          disabled={off}
          onClick={() => !on && onChange?.(o.value)}
        >
          <span className="dph-form-row__label">{o.label}</span>
          <span className="dph-picker-option__check" aria-hidden="true">{on && <Icon name="checkmark" weight="semibold" />}</span>
        </button>
      </div>
    );
  });
  return (
    <div className="dph-picker" data-variant="inline" data-form={formRow || undefined} role="radiogroup" aria-label={label} aria-disabled={disabled || undefined} data-testid={testId}>
      {rows}
    </div>
  );
}

/** Segmented style: reuses SegmentedControl (navigation area); options map to segments by index. */
function SegmentedPicker({ label, options, value, onChange, disabled, formRow, testId }: Inner) {
  const control = (
    <SegmentedControl
      label={label}
      segments={options.map((o) => ({ label: o.label, disabled: o.disabled }))}
      selected={options.findIndex((o) => o.value === value)}
      onChange={(i) => { const o = options[i]; if (o) onChange?.(o.value); }}
      disabled={disabled}
      testId={formRow ? undefined : testId}
    />
  );
  if (!formRow) return control;
  return (
    <div className="dph-list-item dph-form-row dph-picker-segmented-row" role="listitem" data-testid={testId}>
      <div className="dph-list-item__body dph-form-row__body"><span className="dph-form-row__control" data-fill="">{control}</span></div>
    </div>
  );
}
