import { useId, useMemo } from "react";
import { DateWheels } from "./DateWheels";
import { DateCalendar } from "./DateCalendar";
import "./FormRow.css";
import "./DatePicker.css";

export type DatePickerMode = "date" | "time" | "dateTime" | "countdown";
export type DatePickerVariant = "compact" | "graphical" | "wheels";

export interface DatePickerProps {
  /** Visible row label (e.g. "Date") and accessible name. */
  label: string;
  /** Hide the label visually (labelsHidden()); it stays the accessible name. */
  labelHidden?: boolean;
  /**
   * ISO 8601 date-time, e.g. "2026-11-20T09:00:00Z", shown in `timeZone`.
   * mode="countdown": an ISO 8601 duration instead, e.g. "PT1H30M" (0–23 h 59 min).
   */
  value: string;
  /** displayedComponents: .date, .hourAndMinute, both, or a countdown timer (wheels only). */
  mode?: DatePickerMode;
  /**
   * compact: gray pills that open the system picker (default). graphical: inline calendar (with a time row for dateTime).
   * wheels: spinning wheels. Countdown always uses wheels.
   */
  variant?: DatePickerVariant;
  /** Called with the new ISO string (UTC), or the new ISO duration for countdown. */
  onChange?: (value: string) => void;
  /** BCP 47 locale for the text (Intl). Fixed by default so screenshots are stable. */
  locale?: string;
  /** IANA time zone the value is shown and edited in (e.g. "Europe/London"); the device's by default. */
  timeZone?: string;
  /** graphical + dateTime: visible label of the time row (e.g. "Time"). */
  timeLabel?: string;
  /** Earliest / latest selectable ISO date-time. */
  min?: string;
  max?: string;
  disabled?: boolean;
  /** Render as a row inside ListSection (Form): label leading, pills trailing; graphical/wheels fill the row. */
  formRow?: boolean;
  testId?: string;
}
const pad = (n: number) => String(n).padStart(2, "0");
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Date picker: compact pills, inline calendar (graphical) or wheels, incl. a countdown timer. */
export function DatePicker(props: DatePickerProps) {
  const { variant = "compact", mode = "date", formRow, testId } = props;
  if (variant === "compact" && mode !== "countdown") return <CompactDatePicker {...props} />;
  const body = variant === "graphical" && mode !== "countdown" && mode !== "time"
    ? <DateCalendar {...props} mode={mode} testId={formRow ? undefined : testId} />
    : <DateWheels {...props} mode={mode} testId={formRow ? undefined : testId} />;
  if (!formRow) return body;
  return (
    <div className="dph-list-item dph-form-row dph-date-picker-row" role="listitem" data-testid={testId}>
      <div className="dph-list-item__body dph-form-row__body"><span className="dph-form-row__control" data-fill="">{body}</span></div>
    </div>
  );
}

/** Compact style: gray capsule "pills" that open the system picker. */
function CompactDatePicker({
  label, labelHidden, value, mode = "date", onChange, locale = "en-US", min, max, disabled, formRow, testId,
}: DatePickerProps) {
  const labelId = useId();
  const date = useMemo(() => new Date(value), [value]);
  const valid = !Number.isNaN(date.getTime());
  const text = useMemo(() => {
    if (!valid) return { date: "", time: "" };
    return {
      date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date),
      time: new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(date),
    };
  }, [date, valid, locale]);
  const minD = min ? new Date(min) : undefined;
  const maxD = max ? new Date(max) : undefined;

  const commit = (part: "date" | "time", v: string) => {
    if (!v) return;
    const base = valid ? date : new Date();
    const next = new Date(base);
    if (part === "date") {
      const [y, m, d] = v.split("-").map(Number);
      next.setFullYear(y!, m! - 1, d!);
    } else {
      const [h, mi] = v.split(":").map(Number);
      next.setHours(h!, mi!, 0, 0);
    }
    onChange?.(next.toISOString());
  };

  const pill = (part: "date" | "time") => (
    <span className="dph-date-picker__pill" data-part={part}>
      <span className="dph-date-picker__text" aria-hidden="true">{part === "date" ? text.date : text.time}</span>
      <input
        className="dph-date-picker__input"
        type={part}
        value={valid ? (part === "date" ? localDate(date) : localTime(date)) : ""}
        min={part === "date" && minD ? localDate(minD) : undefined}
        max={part === "date" && maxD ? localDate(maxD) : undefined}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-description={part === "date" ? text.date : text.time}
        onChange={(e) => commit(part, e.currentTarget.value)}
      />
    </span>
  );
  const pills = (
    <span className="dph-date-picker__pills" data-disabled={disabled || undefined}>
      {mode !== "time" && pill("date")}
      {mode !== "date" && pill("time")}
    </span>
  );
  const caption = <span id={labelId} className={labelHidden ? "dph-visually-hidden" : "dph-form-row__label"}>{label}</span>;

  if (formRow) {
    return (
      <div className="dph-list-item dph-form-row dph-date-picker" role="listitem" data-testid={testId}>
        <div className="dph-list-item__body dph-form-row__body">{caption}<span className="dph-form-row__control">{pills}</span></div>
      </div>
    );
  }
  return <div className="dph-date-picker" data-standalone="" data-testid={testId}>{caption}{pills}</div>;
}
