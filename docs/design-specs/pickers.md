# Pickers: design specs

Design values for the wheel pickers, date pickers and the navigation-link picker. Points, @3x reference screen
(402 × 874). The playground uses UTC, en_US and a fixed date of 2026-11-20 10:00 UTC.

## Wheels — `Wheel.tsx`, `Wheel.css`
| What | Value |
|---|---|
| Picker | 216 tall; date picker 320 wide centred (x 41); picker wheel fills the row (330 in a Form row) |
| Band | quaternarySystemFill (`#747480@0.08` / `#767680@0.18`), capsule, inset 9 from both sides; **drawn over** the selected text (black text reads `#090909`, white reads `#E6E6E8`) |
| Multi-column rows (picker titles, date picker) | pitch 32, band 34; band row 23.5pt regular label; outer rows 21pt |
| Single-column wheel rows | pitch 30, band 32; 21pt in band and outer rows |
| Outer rows | label colour, view alpha 0.447 (both themes), on a cylinder: R 97 / 97.5, α 0.33175 / 0.31325 rad per row, perspective 900 from the picker centre (fit to the 3D cell frames) |
| Outer fade (extra, on top of 0.447) | 0.80 at the band, 0.78 @±30, 0.74 @±51–57, 0.69 @±60, 0.47 @±72, 0.32 @±81, 0.20 @±87, 0 at the edge |
| Multi-column components | width ⌊(W − 18 − 5(n−1))/n⌋, x = 9 + i(w + 5); text centred; outer rows pulled 10% toward the picker centre |
| Visible rows | ±4 (beyond ~±86pt the rows are edge-on) |

### Date picker column anchors (en_US, pt from the picker's leading edge; band row / outer rows)
| Mode | Columns |
|---|---|
| date | month start 27 / 33.65 · day start 166 / 168.33 · year centre 257 / 256.83 |
| dateTime | day: "Nov 20" start 67 / 75.14, weekday hangs before it with a 0.213em gap, "Today" ends 3.149em after the anchor · hour end 180 / 176.33 · minute start 212 / 213 · AM/PM start 264 / 266 |
| time | hour end 99 / 95.33 · minute start 141 / 142 · AM/PM start 200 / 202 |
| countdown | hour end 107 / 103.33 · minute start 163 · units "hour(s)" at 112.67, "min" at 197.67: headline (semibold 17), centre 1pt below the band's |
| Digits | hour and minute columns use monospaced digits; day, year and the dateTime date use proportional digits |
| Ranges | month, day, hour, minute loop; year, dateTime day, AM/PM, countdown hours don't |
| Band text | sits 0.67pt above the row centre |

## Graphical (inline calendar) — `DateCalendar.tsx`, `DatePicker.css`
| What | Value |
|---|---|
| Frame | 330 wide in a Form row (row padding 15/20); date-only 331 tall for 5 week rows (96 + 47·rows); dateTime ≥ 417 |
| Header | 16 from top, 37.67 tall. Title button at +8, 4pt insets, "November 2026" semibold 17; chevron.forward 10.33 × 14 accent, 4pt after |
| Month steppers | 2 × 43.33 × 37.67, the next one ends 6pt past the trailing edge; chevrons 15.33 × 21, accent |
| Weekdays | 16 below the header, 15.67 tall; footnote semibold, uppercase, secondaryLabel; label centres 23.83 + 47.06·i |
| Day grid | 1 below the weekdays; cells 47 × 47 from x 0; circles 44; numbers title3 (20 / 24), drawn 0.67 above the circle centre |
| Selected (not today) | label-colour circle, semibold, systemBackground text (white / black) |
| Selected today | accent circle, semibold white |
| Today (not selected) | accent text, regular, circle accent @ 12% (`#E0F1FF` / `#192A39`) |
| Time row (dateTime) | 5.67 below the grid, 38 tall; "Time" headline at +8, text top 8; compact time pill (36 tall, tertiarySystemFill, 12pt insets) ending 8 from the trailing edge; "10:00 AM" with U+202F before AM |
| Month/year toggle | title turns accent, chevron rotates to point down, steppers hide; month + year wheels (multi-column metrics) centred in the grid's height; time row stays put |

## Picker navigationLink (`picker-wheel` screen)
| What | Value |
|---|---|
| Row | 52 tall, title x 36, value secondaryLabel ending 343.33, chevron 7 × 12 at 356.67 (13.33 after the value, row end − 22.33), tertiaryLabel |
| Form | first headerless section 35 below the safe area (the playground screen adds the gap; the list itself starts flush) |
