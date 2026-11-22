import { useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import "./Chart.css";

export type ChartKind = "bar" | "line" | "donut" | "comparison";
export type ChartTint = "accent" | "blue" | "green" | "indigo" | "orange" | "pink" | "purple" | "red" | "teal" | "yellow" | "gray";
export type ChartAxes = "full" | "minimal" | "none";
export type ChartHighlight = "none" | "last";

export interface ChartDatum {
  /** Category (x-axis label, donut legend entry, comparison bar label). */
  label: string;
  value: number;
}

export interface ChartProps {
  /** bar / line: standard chart marks. donut: ring with legend. comparison: labelled bars (value above each bar). */
  kind: ChartKind;
  data: ChartDatum[];
  /** Accessible name (the chart is also exposed as a data table to assistive tech). */
  label: string;
  /** Frame height in points, axis labels included. Default 170 (comparison: from the rows). */
  height?: number;
  /** Mark colour. Default accent. */
  tint?: ChartTint;
  /** full: default axes. minimal: x labels only, no grid or y axis (highlight cards). none: sparkline. */
  axes?: ChartAxes;
  /** last: every bar grey except the latest, which takes the tint (summary cards). */
  highlight?: ChartHighlight;
  /** Same look as `highlight="last"` but for the bar at this index (e.g. the day to call out). Wins over `highlight`. */
  highlightIndex?: number;
  /** Corner radius of bar tops, in points. Default 0. */
  barRadius?: number;
  /** line: fill under the line (flat 15% with full axes, a fading gradient with minimal / no axes). */
  area?: boolean;
  /** line: dot on each value (PointMark). */
  points?: boolean;
  /** line: smooth (Catmull-Rom) instead of straight segments. */
  smooth?: boolean;
  /** line: a second series drawn in grey behind the main one (e.g. average, last week). Same length as data. */
  compare?: number[];
  /** A horizontal RuleMark at this value: thick tinted line, e.g. the average or a goal. */
  rule?: number;
  /** Text next to the rule, e.g. "Avg" or "Goal". */
  ruleLabel?: string;
  /** Header above the plot: small caps label, e.g. "TOTAL" or "AVERAGE". Setting it shows the header;
   *  while a value is selected the header becomes a callout box over the selection. */
  summaryLabel?: string;
  /** Header number, already formatted, e.g. "6,707". */
  summaryValue?: string;
  /** Unit after the header number, e.g. "steps". */
  summaryUnit?: string;
  /** Line under the header number, e.g. "Nov 14–20, 2026". */
  summaryCaption?: string;
  /** Unit used by comparison bars and the selection callout, e.g. "steps/day". */
  unit?: string;
  /** Formats axis and selection values. Default: the locale's number format. */
  formatValue?: (value: number) => string;
  /** Formats y-axis tick labels, e.g. (v) => `$${v / 1000}K`. Default: formatValue. */
  formatAxis?: (value: number) => string;
  /** Upper end of the y scale; default the next "nice" number above the largest value. */
  yMax?: number;
  /** Selected index (chartXSelection). Controlled when set together with onSelect. */
  selected?: number | null;
  /** Tap or drag across the plot to select a value. */
  onSelect?: (index: number | null) => void;
  testId?: string;
}

const PALETTE: ChartTint[] = ["blue", "green", "orange", "purple", "red", "teal", "yellow", "pink", "indigo"];
const AXIS_FONT = '400 11px -apple-system, BlinkMacSystemFont, "Inter Variable", Inter, system-ui, sans-serif';

/** Charts pick ~3 intervals on 1/2/2.5/5 × 10ⁿ steps, starting at zero. */
function niceScale(max: number): { top: number; step: number } {
  if (max <= 0) return { top: 1, step: 0.25 };
  const raw = max / 3;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  return { top: Math.ceil(max / step) * step, step };
}

let measureCtx: CanvasRenderingContext2D | null = null;
function textWidth(s: string): number {
  if (typeof document === "undefined") return s.length * 6;
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return s.length * 6;
  measureCtx.font = AXIS_FONT;
  return measureCtx.measureText(s).width;
}

/** Catmull-Rom → cubic Bézier through the points. */
function path(pts: [number, number][], smooth: boolean): string {
  if (!pts.length) return "";
  if (!smooth || pts.length < 3) return pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
  let d = `M${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!, p1 = pts[i]!, p2 = pts[i + 1]!, p3 = pts[i + 2] ?? p2;
    d += `C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/** Bar with only its top corners rounded. */
function barPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  if (!rr) return `M${x} ${y + h}V${y}H${x + w}V${y + h}Z`;
  return `M${x} ${y + h}V${y + rr}Q${x} ${y} ${x + rr} ${y}H${x + w - rr}Q${x + w} ${y} ${x + w} ${y + rr}V${y + h}Z`;
}

/** Chart look-alike with styles suited to dashboards (summary cards, highlights, detail charts). */
export function Chart({
  kind, data, label, height = 170, tint = "accent", axes = "full", highlight = "none", highlightIndex, barRadius = 0, area = false, points = false,
  smooth = false, compare, rule, ruleLabel, summaryLabel, summaryValue, summaryUnit, summaryCaption, unit, formatValue, formatAxis, yMax, selected, onSelect, testId,
}: ChartProps) {
  const gid = useRef(`dph-chart-${Math.random().toString(36).slice(2, 8)}`).current;
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const fmt = useMemo(() => formatValue ?? ((v: number) => new Intl.NumberFormat().format(v)), [formatValue]);
  const fmtAxis = formatAxis ?? fmt;
  const sel = selected !== undefined ? selected : hover;
  const setSel = (i: number | null) => { if (selected === undefined) setHover(i); onSelect?.(i); };

  const table = (
    <table className="dph-chart__table">
      <caption>{label}</caption>
      <tbody>{data.map((d, i) => <tr key={i}><th scope="row">{d.label}</th><td>{fmt(d.value)}{unit ? ` ${unit}` : ""}</td></tr>)}</tbody>
    </table>
  );

  /* ── Comparison bars (highlights: value + unit, then a labelled bar; first row tinted, the rest grey) ── */
  if (kind === "comparison") {
    const max = Math.max(1, ...data.map((d) => d.value));
    return (
      <div className="dph-chart" data-kind="comparison" data-tint={tint} data-testid={testId}>
        <ul className="dph-chart__compare" aria-hidden="true">
          {data.map((d, i) => (
            <li key={i}>
              <span className="dph-chart__compare-value">{fmt(d.value)}{unit && <span className="dph-chart__compare-unit"> {unit}</span>}</span>
              <span className="dph-chart__compare-bar" data-first={i === 0 || undefined} style={{ width: `${Math.max(24, (d.value / max) * 100)}%` }}>{d.label}</span>
            </li>
          ))}
        </ul>
        {table}
      </div>
    );
  }

  if (kind === "donut") {
    const total = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
    const legendH = 18.5;
    const d = Math.max(0, Math.min(width, height - legendH));
    const R = d / 2, r0 = R * 0.6, ccx = width / 2, ccy = R;
    let a = 0;
    const gap = 1.5;
    return (
      <div ref={box} className="dph-chart" data-kind="donut" style={{ height }} data-testid={testId}>
        <svg width={width} height={d} aria-hidden="true" className="dph-chart__svg">
          {width > 0 && data.map((datum, i) => {
            const sweep = (Math.max(0, datum.value) / total) * Math.PI * 2;
            if (sweep < 0.0001) return null;
            const i0 = gap / R, i1 = gap / r0, a0 = a, a1 = a + sweep;
            a = a1;
            const P = (r: number, t: number) => `${ccx + r * Math.sin(t)} ${ccy - r * Math.cos(t)}`;
            const p = `M${P(R, a0 + i0)}A${R} ${R} 0 ${sweep - 2 * i0 > Math.PI ? 1 : 0} 1 ${P(R, a1 - i0)}L${P(r0, a1 - i1)}A${r0} ${r0} 0 ${sweep - 2 * i1 > Math.PI ? 1 : 0} 0 ${P(r0, a0 + i1)}Z`;
            return <path key={i} d={p} className="dph-chart__sector" data-tint={PALETTE[i % PALETTE.length]} data-dim={(sel !== null && sel !== i) || undefined} onPointerEnter={() => setSel(i)} onPointerLeave={() => setSel(null)} />;
          })}
        </svg>
        <ul className="dph-chart__legend" aria-hidden="true">
          {data.map((datum, i) => <li key={i} data-tint={PALETTE[i % PALETTE.length]}>{datum.label}</li>)}
        </ul>
        {table}
      </div>
    );
  }

  /* ── Bar / line ── */
  const values = [...data.map((d) => d.value), ...(compare ?? []), rule ?? 0];
  const { top, step } = niceScale(yMax ?? Math.max(0, ...values));
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 1000; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  const full = axes === "full";
  const labelW = full ? Math.max(...ticks.map((t) => textWidth(fmtAxis(t)))) : 0;
  const summary = summaryLabel !== undefined ? { label: summaryLabel, value: summaryValue ?? "", unit: summaryUnit, caption: summaryCaption } : null;
  const summaryH = summary ? 86 : 0;
  const xRow = axes === "none" ? 0 : 18;
  const plotL = 0, plotT = summaryH + (axes === "minimal" ? 2 : 0), plotB = height - xRow;
  const plotR = full ? Math.max(40, width - Math.ceil(labelW) - 4) : width;
  const plotW = plotR - plotL, plotH = Math.max(1, plotB - plotT);
  const band = data.length ? plotW / data.length : plotW;
  // Full axes start at zero (default). Minimal / sparkline line charts fit the data range so trends read clearly.
  const dataVals = [...data.map((d) => d.value), ...(compare ?? [])];
  const lo = !full && kind === "line" && dataVals.length ? Math.min(...dataVals) * 0.85 : 0;
  const hi = full ? top : Math.max(lo + 1e-6, ...values) * 1.04;
  const y = (v: number) => plotB - ((v - lo) / (hi - lo)) * plotH;
  const cx = (i: number) => plotL + band * (i + 0.5);
  const barW = axes === "none" ? Math.min(band * 0.7, 8) : band * 0.7065;

  const pick = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (axes === "none") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    if (x < plotL || x > plotR) return setSel(null);
    setSel(Math.max(0, Math.min(data.length - 1, Math.floor((x - plotL) / band))));
  };

  const pts = data.map((d, i) => [cx(i), y(d.value)] as [number, number]);
  const linePath = path(pts, smooth);
  const comparePath = compare ? path(compare.map((v, i) => [cx(i), y(v)] as [number, number]), smooth) : "";
  const areaPath = pts.length ? `${linePath}L${cx(data.length - 1)} ${plotB}L${cx(0)} ${plotB}Z` : "";
  const active = sel !== null && data[sel] ? sel : null;
  const hl = highlightIndex !== undefined && data[highlightIndex] ? highlightIndex : highlight === "last" ? data.length - 1 : null;

  let header: ReactNode = null;
  if (summary) {
    const s = active !== null ? { label: summary.label, value: fmt(data[active]!.value), unit: summary.unit ?? unit, caption: data[active]!.label } : summary;
    const boxed = active !== null;
    const left = boxed ? Math.max(0, Math.min(plotR - 170, cx(active!) - 85)) : 0;
    header = (
      <div className="dph-chart__summary" data-boxed={boxed || undefined} style={boxed ? { insetInlineStart: left } : undefined} aria-live="polite">
        <span className="dph-chart__summary-label">{s.label}</span>
        <span className="dph-chart__summary-value">{s.value}{s.unit && <span className="dph-chart__summary-unit"> {s.unit}</span>}</span>
        {s.caption && <span className="dph-chart__summary-caption">{s.caption}</span>}
      </div>
    );
  }

  return (
    <div ref={box} className="dph-chart" data-kind={kind} data-axes={axes} data-highlight={hl !== null ? "last" : highlight} data-tint={tint} style={{ height }} data-testid={testId}>
      {width > 0 && (
        <svg width={width} height={height} className="dph-chart__svg" aria-hidden="true" onPointerDown={pick} onPointerMove={(e) => (e.buttons || e.pointerType === "mouse") && pick(e)} onPointerLeave={() => setSel(null)}>
          <defs>
            <linearGradient id={`${gid}-fade`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className="dph-chart__fade-top" />
              <stop offset="1" className="dph-chart__fade-bottom" />
            </linearGradient>
          </defs>
          {full && ticks.map((t) => (
            <g key={t}>
              <line className="dph-chart__grid" x1={plotL} x2={plotR} y1={y(t)} y2={y(t)} />
              <text className="dph-chart__axis" x={plotR + 5} y={y(t)} dominantBaseline="central">{fmtAxis(t)}</text>
            </g>
          ))}
          {full && Array.from({ length: data.length + 1 }, (_, i) => (
            <line key={i} className="dph-chart__grid" data-dashed="" x1={plotL + band * i} x2={plotL + band * i} y1={plotT} y2={height} />
          ))}
          {axes !== "none" && data.map((d, i) => <text key={i} className="dph-chart__axis" data-minimal={!full || undefined} x={cx(i)} y={plotB + 14.4} textAnchor="middle">{d.label}</text>)}
          {kind === "bar" && data.map((d, i) => (
            <path
              key={i}
              className="dph-chart__bar"
              data-muted={(hl !== null && i !== hl) || undefined}
              data-dim={(active !== null && active !== i) || undefined}
              d={barPath(cx(i) - barW / 2, y(d.value), barW, Math.max(0, plotB - y(d.value)), barRadius)}
              style={{ ["--_o" as string]: `${plotB}px` }}
            />
          ))}
          {kind === "line" && (
            <>
              {/* Full axes: flat 15% AreaMark (default look); minimal / none: fading gradient (trend charts). */}
              {area && <path className="dph-chart__area" d={areaPath} style={full ? undefined : { fill: `url(#${gid}-fade)` }} />}
              {compare && <path className="dph-chart__line" data-compare="" d={comparePath} />}
              <path className="dph-chart__line" data-thick={!full || undefined} d={linePath} />
              {points && pts.map(([px, py], i) => <circle key={i} className="dph-chart__point" cx={px} cy={py} r={4} />)}
              {hl !== null && pts[hl] && <circle className="dph-chart__point" data-selected="" cx={pts[hl]![0]} cy={pts[hl]![1]} r={5} />}
            </>
          )}
          {rule !== undefined && (
            <g className="dph-chart__rulemark">
              <line x1={plotL} x2={plotR} y1={y(rule)} y2={y(rule)} />
              {ruleLabel && <text x={plotL + 2} y={y(rule) - 6}>{ruleLabel}</text>}
            </g>
          )}
          {active !== null && (
            <g className="dph-chart__selection">
              <line className="dph-chart__rule" x1={cx(active)} x2={cx(active)} y1={summary ? summaryH - 4 : plotT} y2={kind === "bar" ? y(data[active]!.value) : plotB} />
              {kind === "line" && <circle className="dph-chart__point" data-selected="" cx={cx(active)} cy={y(data[active]!.value)} r={5} />}
            </g>
          )}
        </svg>
      )}
      {header}
      {!summary && active !== null && width > 0 && (
        <div className="dph-chart__callout" style={{ insetInlineStart: Math.max(0, Math.min(plotR - 96, cx(active) - 48)) }} aria-live="polite">
          <span className="dph-chart__callout-label">{data[active]!.label}</span>
          <span className="dph-chart__callout-value">{fmt(data[active]!.value)}{unit ? ` ${unit}` : ""}</span>
        </div>
      )}
      {table}
    </div>
  );
}
