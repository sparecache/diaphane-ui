import { useMemo, type ReactNode } from "react";
import { Wheel, type WheelColumn } from "./Wheel";
import { dayDiff, daysInMonth, formatDuration, fromParts, parseDuration, partsOf, type DateParts } from "./dateParts";
import type { DatePickerProps } from "./DatePicker";

/**
 * DatePicker variant="wheels" (wheels, 320 × 216, centred). Internal to DatePicker.
 * Column anchors in en_US (pt from the picker's leading edge):
 * band rows 23.5pt, outer rows 21pt (outer anchors differ slightly, as the smaller text is re-laid out).
 */
type Geo = Pick<WheelColumn, "x" | "outerX" | "align" | "hit">;
const G = {
  month: { x: 27, outerX: 33.65, align: "start", hit: [9, 160] },
  day: { x: 166, outerX: 168.33, align: "start", hit: [160, 214] },
  year: { x: 257, outerX: 256.83, align: "center", hit: [214, 311] },
  dtDate: { x: 67, outerX: 75.14, align: "start", hit: [9, 140] },
  dtHour: { x: 180, outerX: 176.33, align: "end", hit: [140, 196] },
  dtMinute: { x: 212, outerX: 213, align: "start", hit: [196, 250] },
  dtPeriod: { x: 264, outerX: 266, align: "start", hit: [250, 311] },
  tHour: { x: 99, outerX: 95.33, align: "end", hit: [9, 125] },
  tMinute: { x: 141, outerX: 142, align: "start", hit: [125, 185] },
  tPeriod: { x: 200, outerX: 202, align: "start", hit: [185, 311] },
  cdHour: { x: 107, outerX: 103.33, align: "end", hit: [9, 155] },
  cdMinute: { x: 163, outerX: 163, align: "start", hit: [155, 311] },
} satisfies Record<string, Geo>;

const pad2 = (n: number) => String(n).padStart(2, "0");
const YEARS = 200; // rows either side of the current year
const DAYS = 730; // dateTime: rows either side of the current day

export function DateWheels({ label, value, mode = "date", onChange, locale = "en-US", timeZone: tz, min, max, disabled, testId }: DatePickerProps) {
  const fmt = useMemo(() => ({
    month: new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }),
    weekday: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }),
    monthDay: new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }),
    num: new Intl.NumberFormat(locale, { useGrouping: false }),
    hour12: new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hourCycle?.startsWith("h1") ?? true,
    order: new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).formatToParts(new Date(Date.UTC(2026, 10, 20)))
      .filter((p) => p.type === "year" || p.type === "month" || p.type === "day").map((p) => p.type).join(","),
    periods: ["am", "pm"].map((_, i) => new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true, timeZone: "UTC" })
      .formatToParts(new Date(Date.UTC(2026, 0, 1, i ? 22 : 10))).find((p) => p.type === "dayPeriod")?.value ?? (i ? "PM" : "AM")),
    field: (f: "month" | "day" | "year" | "hour" | "minute" | "dayPeriod" | "weekOfYear") => {
      try { return new Intl.DisplayNames(locale, { type: "dateTimeField" }).of(f) ?? f; } catch { return f; }
    },
    today: (() => { const t = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(0, "day"); return t.charAt(0).toLocaleUpperCase(locale) + t.slice(1); })(),
    unit: (unit: "hour" | "minute", n: number, display: "long" | "short") =>
      new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: display }).formatToParts(n).filter((p) => p.type === "unit").map((p) => p.value).join(""),
  }), [locale]);

  const isCountdown = mode === "countdown";
  const date = useMemo(() => new Date(value), [value]);
  const p: DateParts = useMemo(() => (isCountdown || Number.isNaN(date.getTime()) ? partsOf(new Date(), tz) : partsOf(date, tz)), [date, tz, isCountdown]);
  const today = partsOf(new Date(), tz);
  const minT = min ? Date.parse(min) : -Infinity;
  const maxT = max ? Date.parse(max) : Infinity;

  const emit = (y: number, m: number, d: number, h: number, mi: number) => {
    const dim = daysInMonth(y, m);
    let t = fromParts(y, m, Math.min(d, dim), h, mi, tz).getTime();
    t = Math.max(minT, Math.min(maxT, t));
    onChange?.(new Date(t).toISOString());
  };
  /** Hour/minute digits are monospaced in the date picker; day, year and date digits are proportional. */
  const txt = (s: string, tabular?: boolean) => <span className="dph-date-wheels__text" data-tabular={tabular || undefined}>{s}</span>;

  const columns: WheelColumn[] = [];
  let overlay: ReactNode = null;
  const mdy = fmt.order === "month,day,year";
  const geo = (g: Geo): Geo => (mdy || mode !== "date" ? g : {});

  if (isCountdown) {
    const total = Math.min(23 * 60 + 59, parseDuration(value));
    const h = Math.floor(total / 60), mi = total % 60;
    const set = (nh: number, nm: number) => onChange?.(formatDuration(nh * 60 + nm));
    columns.push(
      { id: "h", label: fmt.unit("hour", 2, "long"), count: 24, selected: h, render: (i) => txt(fmt.num.format(i), true), text: (i) => `${fmt.num.format(i)} ${fmt.unit("hour", i, "long")}`, ...G.cdHour },
      { id: "m", label: fmt.unit("minute", 2, "long"), count: 60, selected: mi, loop: true, render: (i) => txt(fmt.num.format(i), true), text: (i) => `${fmt.num.format(i)} ${fmt.unit("minute", i, "short")}`, ...G.cdMinute },
    );
    overlay = (
      <>
        <span className="dph-date-wheels__unit" style={{ insetInlineStart: 112.67 }}>{fmt.unit("hour", h, "long")}</span>
        <span className="dph-date-wheels__unit" style={{ insetInlineStart: 197.67 }}>{fmt.unit("minute", mi, "short")}</span>
      </>
    );
    return (
      <Wheel width={320} label={label} disabled={disabled} testId={testId} columns={columns} overlay={overlay}
        onSelect={(c, i) => (c === 0 ? set(i, mi) : set(h, i))} />
    );
  }

  if (mode === "date") {
    const dim = daysInMonth(p.y, p.m);
    const cols: Record<string, WheelColumn> = {
      month: { id: "month", label: fmt.field("month"), count: 12, loop: true, selected: p.m - 1, render: (i) => txt(fmt.month.format(Date.UTC(2026, i, 1))), text: (i) => fmt.month.format(Date.UTC(2026, i, 1)), ...geo(G.month) },
      day: { id: "day", label: fmt.field("day"), count: dim, loop: true, selected: p.d - 1, render: (i) => txt(fmt.num.format(i + 1)), text: (i) => fmt.num.format(i + 1), ...geo(G.day) },
      year: { id: "year", label: fmt.field("year"), count: YEARS * 2 + 1, selected: YEARS, render: (i) => txt(fmt.num.format(p.y - YEARS + i)), text: (i) => fmt.num.format(p.y - YEARS + i), ...geo(G.year) },
    };
    for (const k of fmt.order.split(",")) columns.push(cols[k]!);
  } else {
    if (mode === "dateTime") {
      const base = Date.UTC(p.y, p.m - 1, p.d);
      const at = (i: number) => new Date(base + (i - DAYS) * 86_400_000);
      const isToday = (i: number) => dayDiff(today, p) + (i - DAYS) === 0;
      columns.push({
        id: "date", label: fmt.field("day"), count: DAYS * 2 + 1, selected: DAYS,
        render: (i) => (isToday(i)
          ? <span className="dph-date-wheels__text" data-today="">{fmt.today}</span>
          : <span className="dph-date-wheels__text"><span className="dph-date-wheels__weekday">{fmt.weekday.format(at(i))}</span>{fmt.monthDay.format(at(i))}</span>),
        text: (i) => (isToday(i) ? fmt.today : `${fmt.weekday.format(at(i))} ${fmt.monthDay.format(at(i))}`),
        ...G.dtDate,
      });
    }
    const dt = mode === "dateTime";
    const hourLabel = (i: number) => (fmt.hour12 ? fmt.num.format(i === 0 ? 12 : i) : pad2(i));
    columns.push(
      { id: "hour", label: fmt.field("hour"), count: fmt.hour12 ? 12 : 24, loop: true, selected: fmt.hour12 ? p.h % 12 : p.h, render: (i) => txt(hourLabel(i), true), text: hourLabel, ...(fmt.hour12 ? (dt ? G.dtHour : G.tHour) : {}) },
      { id: "minute", label: fmt.field("minute"), count: 60, loop: true, selected: p.mi, render: (i) => txt(pad2(i), true), text: pad2, ...(fmt.hour12 ? (dt ? G.dtMinute : G.tMinute) : {}) },
    );
    if (fmt.hour12) columns.push({ id: "period", label: fmt.field("dayPeriod"), count: 2, selected: p.h >= 12 ? 1 : 0, render: (i) => txt(fmt.periods[i]!), text: (i) => fmt.periods[i]!, ...(dt ? G.dtPeriod : G.tPeriod) });
  }

  const onSelect = (c: number, i: number) => {
    const id = columns[c]?.id;
    let { y, m, d, h, mi } = p;
    if (id === "month") m = i + 1;
    else if (id === "day") d = i + 1;
    else if (id === "year") y = p.y - YEARS + i;
    else if (id === "date") { const n = new Date(Date.UTC(p.y, p.m - 1, p.d) + (i - DAYS) * 86_400_000); y = n.getUTCFullYear(); m = n.getUTCMonth() + 1; d = n.getUTCDate(); }
    else if (id === "hour") h = fmt.hour12 ? i + (p.h >= 12 ? 12 : 0) : i;
    else if (id === "minute") mi = i;
    else if (id === "period") h = (p.h % 12) + (i ? 12 : 0);
    emit(y, m, d, h, mi);
  };
  return <Wheel width={320} label={label} disabled={disabled} testId={testId} columns={columns} onSelect={onSelect} />;
}
