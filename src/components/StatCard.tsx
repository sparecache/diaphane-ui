import { Icon, type IconName } from "./Icon";
import { Chart, type ChartTint } from "./Chart";
import "./StatCard.css";

export type StatCardSize = "regular" | "compact";
export type StatTrend = "up" | "down" | "flat";

export interface StatCardProps {
  /** Metric name, drawn in the tint with its icon (e.g. "Steps", "Active Energy"). */
  title: string;
  icon?: IconName;
  /** Category colour of the title, icon and highlighted bar. Default accent. */
  tint?: ChartTint;
  /** Formatted value, e.g. "6,707". */
  value: string;
  /** Unit after the value, e.g. "steps", "kcal". */
  unit?: string;
  /** Small label above the value, e.g. "Latest", "Average", "Today". */
  label?: string;
  /** Top-trailing caption, e.g. the time of the latest sample ("22:50") or "Yesterday". */
  caption?: string;
  /** Recent values for the mini chart (oldest first; the last one is highlighted). */
  history?: number[];
  /** Mini chart style: bars (activity) or line (sparkline). Default bars. */
  chart?: "bars" | "line";
  /** Change versus the previous period, shown under the value. */
  trend?: StatTrend;
  /** Text next to the trend arrow, e.g. "12% vs last week". */
  trendLabel?: string;
  /** compact: two-up grid tile without the mini chart. */
  size?: StatCardSize;
  /** Makes the card tappable and shows a chevron (push the metric's detail page). */
  onPress?: () => void;
  testId?: string;
}

/**
 * Metric summary card for dashboards (17pt semibold tinted title,
 * caption + chevron trailing, 30pt value with a 16pt secondary unit, 7-bar mini chart with the latest bar tinted).
 */
export function StatCard({
  title, icon, tint = "accent", value, unit, label, caption, history, chart = "bars", trend, trendLabel, size = "regular", onPress, testId,
}: StatCardProps) {
  const body = (
    <>
      <span className="dph-stat__header">
        <span className="dph-stat__title">
          {icon && <Icon name={icon} weight="semibold" />}
          <span>{title}</span>
        </span>
        {(caption || onPress) && (
          <span className="dph-stat__caption">
            {caption}
            {onPress && <Icon name="chevron.right" weight="semibold" scale="small" />}
          </span>
        )}
      </span>
      <span className="dph-stat__body">
        <span className="dph-stat__figure">
          {label && <span className="dph-stat__label">{label}</span>}
          <span className="dph-stat__value">{value}{unit && <span className="dph-stat__unit"> {unit}</span>}</span>
          {trend && (
            <span className="dph-stat__trend" data-trend={trend}>
              {trend !== "flat" && <Icon name={trend === "up" ? "arrow.up.right" : "arrow.down.right"} weight="bold" scale="small" />}
              {trendLabel}
            </span>
          )}
        </span>
        {size === "regular" && history && history.length > 1 && (
          <span className="dph-stat__chart" aria-hidden="true">
            <Chart
              kind={chart === "line" ? "line" : "bar"}
              label={title}
              data={history.map((v, i) => ({ label: String(i), value: v }))}
              axes="none"
              highlight="last"
              barRadius={2}
              area={chart === "line"}
              smooth={chart === "line"}
              tint={tint}
              height={50}
            />
          </span>
        )}
      </span>
    </>
  );
  return onPress ? (
    <button type="button" className="dph-stat" data-size={size} data-tint={tint} onClick={onPress} data-testid={testId}>{body}</button>
  ) : (
    <div className="dph-stat" data-size={size} data-tint={tint} data-testid={testId}>{body}</div>
  );
}
