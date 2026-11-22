/** Calendar math in an explicit IANA time zone (or the device's when `tz` is undefined), via Intl. Internal to DatePicker. */

export interface DateParts { y: number; m: number; d: number; h: number; mi: number; wd: number }

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function partsFormat(tz?: string) {
  const k = tz ?? "";
  let f = fmtCache.get(k);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", weekday: "short",
    });
    fmtCache.set(k, f);
  }
  return f;
}
const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Wall-clock parts of `date` in `tz` (m 1–12, wd 0 = Sunday). */
export function partsOf(date: Date, tz?: string): DateParts {
  const p: Record<string, string> = {};
  for (const x of partsFormat(tz).formatToParts(date)) p[x.type] = x.value;
  return { y: +p.year!, m: +p.month!, d: +p.day!, h: +p.hour! % 24, mi: +p.minute!, wd: WD[p.weekday!] ?? 0 };
}

/** The instant whose wall clock in `tz` reads y-m-d h:mi (overflowing fields roll over like Date.UTC). */
export function fromParts(y: number, m: number, d: number, h: number, mi: number, tz?: string): Date {
  const want = Date.UTC(y, m - 1, d, h, mi);
  let t = want;
  for (let i = 0; i < 2; i++) {
    const p = partsOf(new Date(t), tz);
    t += want - Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi);
  }
  return new Date(t);
}

export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
/** Weekday (0 = Sunday) of the 1st of the month. */
export const firstWeekday = (y: number, m: number) => new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
export const sameDay = (a: DateParts, b: DateParts) => a.y === b.y && a.m === b.m && a.d === b.d;
/** Whole days from a to b (calendar dates). */
export const dayDiff = (a: DateParts, b: DateParts) => Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);

/** First day of the week for a locale (0 = Sunday), from Intl.Locale week info when the engine has it. */
export function weekStart(locale: string): number {
  try {
    const l = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const fd = l.getWeekInfo?.().firstDay ?? l.weekInfo?.firstDay;
    if (fd) return fd % 7;
  } catch { /* fall through */ }
  return /-(US|CA|JP|BR|MX|IL|KR|TW|PH|IN|ZA)\b/i.test(locale) || locale === "en" ? 0 : 1;
}

/** ISO 8601 duration ("PT1H30M") ↔ minutes. */
export function parseDuration(v: string): number {
  const m = /^P(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/.exec(v.trim());
  return m ? (+(m[1] ?? 0)) * 60 + +(m[2] ?? 0) : 0;
}
export const formatDuration = (min: number) => `PT${Math.floor(min / 60)}H${min % 60}M`;

export const mod = (n: number, m: number) => ((n % m) + m) % m;
