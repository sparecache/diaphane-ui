# Dashboards and charts: design specs

Design values for dashboard-style stat cards, notification cards and charts (`StatCard`, `NotificationCard`, `Chart`).

## Summary page
- **Header wash**: the category tint at ≈45% over the grouped background at the top, gone by 300pt, scrolls with the content → `Screen tint`.
- **Notifications card**: 192pt, small-caps `NOTIFICATIONS` header with a hairline and a 22pt grey close circle; 40pt tinted
  circle icon, 17pt semibold text, 30pt capsule action filled with the tint at ≈18% → `NotificationCard`.

## Summary card
| Part | Value |
|---|---|
| Card | grouped surface, 26pt corners, 16pt from the screen sides, 132pt tall, 17pt padding |
| Title | 17pt semibold in the category tint, with its icon |
| Caption | time of the latest sample, ≈14pt secondary, chevron in tertiary |
| Value | ≈30pt semibold (cap height 21pt) + unit 16pt semibold secondary |
| Mini chart | 7 bars × 8pt, 3.3pt apart, up to 50pt, systemGray5 (`#E5E4EA`) with the latest bar tinted, bottom-aligned with the value |
| Variant | "Latest" label above the value; a dot/range mini chart is also possible |
→ `StatCard`.

## Detail chart
Default chart styling (axes, gridlines and bars as `Chart kind="bar"` draws them) plus: a `TOTAL / value unit / date` header that
turns into a tertiary-fill callout box over the selected bar, linked by a 2pt rule → `summaryLabel / summaryValue /
summaryUnit / summaryCaption`. Range control `D W M 6M Y`.

## Highlight cards
- **Comparison**: value + unit (28pt / 17pt), then a 24pt bar with its label inside; current period tinted with white text,
  previous systemGray5 → `Chart kind="comparison"`.
- **Average**: grey bars (single-letter days) under a thick tinted average rule → `axes="minimal" highlight="last" rule`.
- **Cumulative today vs average**: 3pt tinted line over a 3pt grey line, legend dots, a "now" rule, dotted time axis →
  `kind="line" axes="minimal" compare smooth`.
