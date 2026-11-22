import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Icon } from "./Icon";
import { Wheel } from "./Wheel";
import { daysInMonth, firstWeekday, fromParts, mod, partsOf, sameDay, weekStart, type DateParts } from "./dateParts";
import type { DatePickerProps } from "./DatePicker";

/**
 * DatePicker variant="graphical" (inline calendar). Internal to DatePicker.
 * Design values (330pt wide in a Form row); numbers in DatePicker.css.
 */
export function DateCalendar({ label, timeLabel, value, mode = "date", onChange, locale = "en-US", timeZone: tz, min, max, disabled, testId }: DatePickerProps) {
  const date = useMemo(() => new Date(value), [value]);
  const valid = !Number.isNaN(date.getTime());
  const sel = useMemo(() => partsOf(valid ? date : new Date(), tz), [date, valid, tz]);
  const today = partsOf(new Date(), tz);
  const [shown, setShown] = useState({ y: sel.y, m: sel.m });
  const [picking, setPicking] = useState(false);
  const [focusDay, setFocusDay] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // Follow the value to its month when it changes from outside.
  useEffect(() => { setShown({ y: sel.y, m: sel.m }); }, [sel.y, sel.m]);

  const fmt = useMemo(() => ({
    title: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }),
    month: new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }),
    weekday: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }),
    full: new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC" }),
    time: new Intl.DateTimeFormat(locale, { timeStyle: "short", timeZone: tz }),
    num: new Intl.NumberFormat(locale, { useGrouping: false }),
    names: (() => { try { const n = new Intl.DisplayNames(locale, { type: "dateTimeField" }); return { month: n.of("month") ?? "", year: n.of("year") ?? "" }; } catch { return { month: "", year: "" }; } })(),
  }), [locale, tz]);

  const ws = weekStart(locale);
  const lead = mod(firstWeekday(shown.y, shown.m) - ws, 7);
  const dim = daysInMonth(shown.y, shown.m);
  const rows = Math.ceil((lead + dim) / 7);
  const minP = min ? partsOf(new Date(min), tz) : null;
  const maxP = max ? partsOf(new Date(max), tz) : null;
  const key = (p: { y: number; m: number; d: number }) => p.y * 10000 + p.m * 100 + p.d;
  const outOfRange = (d: number) => {
    const k = key({ ...shown, d });
    return (minP && k < key(minP)) || (maxP && k > key(maxP));
  };

  const move = (dm: number) => {
    setFocusDay(null);
    setShown((s) => { const t = s.m - 1 + dm; return { y: s.y + Math.floor(t / 12), m: mod(t, 12) + 1 }; });
  };
  const pick = (d: number) => {
    if (disabled || outOfRange(d)) return;
    onChange?.(fromParts(shown.y, shown.m, d, sel.h, sel.mi, tz).toISOString());
  };
  const commitTime = (v: string) => {
    const [h, mi] = v.split(":").map(Number);
    if (h === undefined || mi === undefined || Number.isNaN(h)) return;
    onChange?.(fromParts(sel.y, sel.m, sel.d, h, mi, tz).toISOString());
  };

  // Roving focus over the day buttons; arrows move by day / week and page the month at the edges.
  const current = focusDay ?? (shown.y === sel.y && shown.m === sel.m ? sel.d : 1);
  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let delta = step[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    if (getComputedStyle(e.currentTarget).direction === "rtl" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) delta = -delta;
    const t = new Date(Date.UTC(shown.y, shown.m - 1, current + delta));
    const ny = t.getUTCFullYear(), nm = t.getUTCMonth() + 1;
    if (ny !== shown.y || nm !== shown.m) setShown({ y: ny, m: nm });
    setFocusDay(t.getUTCDate());
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${t.getUTCDate()}"]`)?.focus());
  };

  const weekdays = Array.from({ length: 7 }, (_, i) => fmt.weekday.format(Date.UTC(2026, 10, 1 + mod(ws + i, 7)))); // 2026-11-01 is a Sunday
  const cells: (number | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  while (cells.length < rows * 7) cells.push(null);
  const shownP = (d: number): DateParts => ({ y: shown.y, m: shown.m, d, h: 0, mi: 0, wd: 0 });
  const title = fmt.title.format(Date.UTC(shown.y, shown.m - 1, 1));
  // The day period is set off with a narrow no-break space ("10:00 AM"); some engines' Intl use a full space.
  const timeText = valid ? fmt.time.format(date).replace(/[ \u00a0](?=[^\d\s]+$)/u, "\u202f") : "";

  return (
    <div className="dph-date-calendar" data-mode={mode} data-rows={rows} data-disabled={disabled || undefined} role="group" aria-label={label} data-testid={testId}>
      <div className="dph-date-calendar__header">
        <button type="button" className="dph-date-calendar__title" aria-expanded={picking} onClick={() => setPicking((v) => !v)} disabled={disabled}>
          <span aria-live="polite">{title}</span>
          <span className="dph-date-calendar__title-chevron" aria-hidden="true"><Icon name="chevron.forward" weight="semibold" /></span>
        </button>
        {!picking && (
          <span className="dph-date-calendar__nav">
            <button type="button" className="dph-date-calendar__step" aria-label={fmt.title.format(Date.UTC(shown.y, shown.m - 2, 1))} onClick={() => move(-1)} disabled={disabled}>
              <Icon name="chevron.backward" weight="medium" />
            </button>
            <button type="button" className="dph-date-calendar__step" aria-label={fmt.title.format(Date.UTC(shown.y, shown.m, 1))} onClick={() => move(1)} disabled={disabled}>
              <Icon name="chevron.forward" weight="medium" />
            </button>
          </span>
        )}
      </div>
      {picking ? (
        <div className="dph-date-calendar__month-year" style={{ "--_rows": rows } as CSSProperties}>
          <Wheel
            label={title}
            disabled={disabled}
            columns={[
              { id: "m", label: fmt.names.month, count: 12, loop: true, selected: shown.m - 1, render: (i) => fmt.month.format(Date.UTC(2026, i, 1)), text: (i) => fmt.month.format(Date.UTC(2026, i, 1)) },
              { id: "y", label: fmt.names.year, count: 401, selected: 200, render: (i) => fmt.num.format(shown.y - 200 + i), text: (i) => fmt.num.format(shown.y - 200 + i) },
            ]}
            onSelect={(c, i) => setShown((s) => (c === 0 ? { ...s, m: i + 1 } : { ...s, y: s.y - 200 + i }))}
          />
        </div>
      ) : (
        <>
          <div className="dph-date-calendar__weekdays" aria-hidden="true">
            {weekdays.map((w, i) => <span key={i}>{w}</span>)}
          </div>
          <div ref={gridRef} className="dph-date-calendar__grid" role="grid" aria-label={title} onKeyDown={onGridKey}>
            {Array.from({ length: rows }, (_, r) => (
              <div key={r} role="row" className="dph-date-calendar__row">
                {cells.slice(r * 7, r * 7 + 7).map((d, i) => {
                  if (d === null) return <span key={i} role="gridcell" className="dph-date-calendar__day" />;
                  const isSel = valid && sameDay(shownP(d), sel);
                  const isToday = sameDay(shownP(d), today);
                  return (
                    <span key={i} role="gridcell" className="dph-date-calendar__day" aria-selected={isSel}>
                      <button
                        type="button"
                        data-day={d}
                        data-selected={isSel || undefined}
                        data-today={isToday || undefined}
                        tabIndex={d === current ? 0 : -1}
                        disabled={disabled || !!outOfRange(d)}
                        aria-label={fmt.full.format(Date.UTC(shown.y, shown.m - 1, d))}
                        aria-current={isToday ? "date" : undefined}
                        onClick={() => { setFocusDay(d); pick(d); }}
                      >
                        {fmt.num.format(d)}
                      </button>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
      {mode === "dateTime" && (
        <div className="dph-date-calendar__time">
          <span className="dph-date-calendar__time-label">{timeLabel}</span>
          <span className="dph-date-picker__pill" data-part="time">
            <span className="dph-date-picker__text" aria-hidden="true">{valid ? timeText : ""}</span>
            <input
              className="dph-date-picker__input"
              type="time"
              value={`${String(sel.h).padStart(2, "0")}:${String(sel.mi).padStart(2, "0")}`}
              disabled={disabled}
              aria-label={timeLabel ?? label}
              aria-description={valid ? fmt.time.format(date) : undefined}
              onChange={(e) => commitTime(e.currentTarget.value)}
            />
          </span>
        </div>
      )}
    </div>
  );
}
