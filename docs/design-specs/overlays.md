# Overlays & feedback: design specs

Design values for alerts, action sheets, sheets, menus, progress, gauges, empty states and banners. All values in
points, @3x reference screen (402 × 874).

## Backdrop ("Library" list behind every overlay)
- Large title: bold 34, frame y 119.67 (safe top 62 + 54pt bar + 3.67), height 40.67, x 16.
- List rows from y 168 (title bottom 160.33 + 7.67), 52pt rows, inset 16, separators inset 20, 1pt.
- Scrim: `#000 @ 0.2` light / `@ 0.48` dark (`--dph-scrim`) for alerts and sheets; popovers (action sheet, menu) don't dim.

## Alert (`alert-two`, `alert-stacked`, `alert-field` screens)
| | value |
|---|---|
| card | 320 wide, x 41, corner 34 continuous; centered on the safe area (y center 451; above the keyboard: (62+546)/2 = 304) |
| surface | light `#EDEDED`, dark `#2C2C2E` → `color-mix(label 7%, systemBackground[elevated])` |
| rim / shadow | `--dph-glass-rim` + `0 12 40 rgb(0 0 0/.12)` |
| title | 22 from top, inset 30, semibold 17, 20.33 tall, label |
| message | 7.33 below title, 15pt regular, 18pt first line then 20pt pitch (2 lines = 38), secondaryLabel; dark glass renders it dimmer (`#7A7A7B` on `#2C2C2E` → secondaryLabel × 0.68) |
| actions | 20.33 below message (header ends +4.33, then 16 padding), padding 16, gap 8, 48 tall, radius 24, medium 17 label color; destructive `systemRed` (#FF383C / #FF4245) |
| action fill | `#767680@0.12/0.24` over glass renders `#CDCDCD` / `#474749` → `color-mix(label 13%, transparent)` |
| layout | 2 actions side by side 140+8+140, cancel leading; 3+ stacked 288 wide, cancel last |
| text field | 16.33 below message, inset 15, 48 tall capsule, same fill, text inset 15, placeholder `placeholderText`; 20 to the actions |
| keyboard | the `alert-field` screen shows the keyboard up (top at 546, 328 tall) and sets `--dph-keyboard-inset: 328px` |

## ActionSheet (`action-sheet` screen)
- It is a **glass popover**: 240 × 284.33 at (81, 308), no dimming, corner 34.
- Centered 0.83 above the safe-area center. Title 22 / inset 30; message 7.67 below title; actions 208 wide, same 48pt capsules.
- The cancel action is **not drawn** (outside tap dismisses).
- Surface light `#FEFEFE` (`label 0.5%`), dark `#353537` (`label 11%` over elevated background); action fill `#DFDFDF` / `#525254`.
- Shadow: broad, ~3.5% darkening 9pt out, ~1.5% 28pt out → `0 10 44 rgb(0 0 0/.13)`.

## Sheet (`sheet-medium`, `sheet-large` screens)
| | large | medium |
|---|---|---|
| frame | (0, 62, 402, 812) | laid out 402 × 469.67 (`50% + 32.67`), scaled 0.9602 about the bottom edge → (8, 415.03, 386, 450.97) |
| corners | top ≈38 (circle fit 37.4) | top ≈31 / bottom ≈56 unscaled (on screen 30 / 54, concentric with the 62pt display corner) |
| surface | `systemGroupedBackground` (#F2F2F7 / elevated #1C1C1E); rows white / #2C2C2E | glass: `#E2E2E6` light (grouped bg 93% + label), dark `#20–#2E` (96%); rows become `label 6%` fills (#D3–#D8 / #2F–#3D) |
| presenting screen | stays in place (no recede), dimmed by the 20% / 48% scrim (`#C2C2C6` light) | same |
- Grabber: 60 × 4 at 6 from the top, centered, `tertiaryLabel` (#B7B7BF on #F2F2F7, #626268 on #1C1C1E).
- Header: nav bar 54 tall starting 16 below the sheet top; 44pt glass circles at x 16 and 342; title semibold 17 centered on y +38.
- Header glyphs: `xmark` 17.33×16 / `checkmark` 18.33×17 image → 17pt regular at the large image scale. Cancel fill light `#F5F5FA` (`--dph-glass-fill`), dark `#3A3A3D` (`label 13.5%` over elevated bg); confirm `accent` (#0086FC / #0492FE) with white glyph.
- First list row 105 below the sheet top (inline bar 70 + list top inset 35).

## Menu (`menu` screen)
- Panel 250 × 167 at (16, 62): covers the trigger, anchored at its leading top corner. Corner ≈33 (circle fit 32.6).
- Surface light `#FAFAFA–#FEFEFE`, dark `#202020` → `color-mix(label 2%, systemBackground[elevated])` for both. Rim `--dph-glass-rim`, shadow `0 10 44 rgb(0 0 0/.13)`; no dimming.
- Padding 10.5 top / 9.5 bottom; rows 42 (text baselines 99.3, 141.3, 204.3); body 17 regular.
- Icons 17pt, centered 40 from the panel edge (24 padding + 32 slot); titles start 64 from the edge.
- Divider block 21 tall, 1pt `separator` line at its middle (y 166–167), inset 24 (x 40–242).

## Progress (`progress` screen)
- Spinners: 20pt (`.medium`) and 37pt (`.large`), 8 capsule spokes; spoke width ≈0.135d (5pt at 37), from r 0.125d to 0.46d, opacity ramp ≈0.78 → 0.2 of secondaryLabel (light #A4A4A7 → #E9E9E9, dark #6E6E72 → #262628). Tinted spinner uses the tint (blue).
- Spinner with a label: spinner, then label 6.33 below in **body 17**, secondaryLabel, centered under the spinner.
- Linear bar: 4 tall capsule, track `#E4E4E6` / `#2B2B2E` (≈ systemGray5), fill tint (#0088FF, green #34C759).
- With labels: title (body, label color) 4 above the bar; currentValueLabel (footnote 13, secondaryLabel) 2.67 below it.
- Stack spacing 28 throughout.

## Gauge (`progress` screen)
- 58 × 58, stroke 5.667 round caps, centerline radius 26.17.
- Capacity: track = tint 35% (`#A6A6A6` / `#595959`), fill from 12 o'clock clockwise; label 11.33pt medium, centered.
- Value (accessoryCircular): 270° arc from −135° to +135°, open at the bottom; marker 5.4 dot in a 9pt cut-out at the value; value 24pt medium digits (17.7 tall) centered; label 11pt in the opening (cap top 384.7).

## EmptyState / ErrorState (`empty`, `empty-search` screens)
- Symbol: 46.3 × 33.3 (`tray`), 38.3 × 38.7 (`magnifyingglass`) → medium weight at 39.4pt; secondaryLabel.
- Symbol ink → title 23.33; title 20pt bold (24 tall); description 3 below, 20pt regular, 24pt first line + 25pt pitch, secondaryLabel.
- Actions 29.67 below the description: `borderedProminent` small (73 × 28, radius 14, 15pt label).
- Text column: default wraps below 335 (padding 34); search fits 335.7 (padding 30).
- Placement: plain view centers on the safe area (block 357.33–548); `variant="search"` centers on the full screen.

## Banner
- Notification-style banner: 8 from the screen edges, 4 below the safe-area top, radius 26, min height 64, `--dph-glass-fill-thick`, tone symbol in a 38pt tile (tone 16%), subheadline semibold title + subheadline message (3 lines max).
