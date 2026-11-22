# Navigation: design specs

Design values for the navigation bar, tab bar, toolbar, search field, segmented control and page control. Points, @3x
reference screen (402 × 874). "Ink" = drawn glyph extent.

## Glass bar surface (all bar controls)
| What | Value |
|---|---|
| Fill (light) | ≈ backdrop + white veil: `#F3F3F8` centre on `#F2F2F7`, brighter `#F8F8FC` near top/bottom edges |
| Fill (dark) | `#1F1F1F`–`#202020` over black (= `--dph-glass-fill` dark) |
| Rim (light) | 1 device px: `#A2A2A8` at the sides, `#D9D9DF` top, `#D6D6DC` bottom; 1pt white specular inside top and bottom |
| Rim (dark) | no side rim; top and bottom edge brighten to `#565656` over ~1.3pt |
| Shadow (light) | ~3 levels darker for ~8pt under the shape (`#EFEFF4` on `#F2F2F7`) |
| Implementation | `--dph-glass-fill`, `--dph-glass-rim`, `--dph-glass-shadow`, blur/saturate tokens (`.dph-bar-glass`) |

## NavigationBar (`nav-large`, `nav-inline` screens)
| What | Value |
|---|---|
| Bar | y 62 (safe top) → 116: **54** tall = 44 item row + 10; no background, no hairline |
| Side margins | items at x **16** and end at **386** |
| Icon item (lone) | **44 × 44** glass circle; glyph centred (gear ink 23 × 23 at 26.3–49.3 / 72.7–95.7) |
| Bar symbols | 17pt **large** image scale (≈ 21.9pt): gear ink 23, magnifyingglass 21, ellipsis 20 × 4.3, back chevron 11 × 19 |
| Text item ("Edit") | capsule 62.33 × 44 at x 323.67; item host inset 4, text padding 11.67 → capsule = 4 + 11.67 + text + 11.67 + 4; **17pt medium** (ink 341–369.3 matches) |
| Merged icon group | one capsule 101.67 × 44 at x 284.33: pad 4 · item 39.67 · gap **16** · item 38 · pad 4; item = glyph box + 7 each side |
| Back button | 44 glass circle at x 16; chevron.backward in **label** colour (rendered in the label colour, not the accent) |
| Inline title + subtitle | "Inbox" 15pt semibold, frame 18.33 tall at y 67.67; "12 unread" 12pt regular secondaryLabel, 14.67 tall at y 85.67; centred on x 201 |
| Large title block | y 116 → 168 (**52**): label 34pt bold at x 16, y 119.67 (+3.67), 40.67 line |
| Content start | large: list at y 168 (no gap); inline: list at **151** (= 116 + 35, inset-grouped top margin) |
| Scroll pocket | backdrop blur 0 → 156 (top); invisible at rest |

## TabBar (`tabbar` screen)
| What | Value |
|---|---|
| Platter | **360 × 62** at x 21, y 791 (bottom 853 = **21** from screen edge, i.e. 13 inside the 34pt home-indicator inset); capsule |
| Inner padding | 4 (buttons 795 → 849, 54 tall) |
| Tab buttons | 98 wide, centres 74 / 158.67 / 243.33 / 328 (step 84.67) → slot 84.67 + 6.67 overhang each side; platter padding-inline 10.67 |
| Selection capsule | 98 × 54, radius 27; light `#E1E1E6` (≈ systemGray5), dark `#0A0A0A` (≈ black) |
| Platter fill | light `#F3F3F8`→`#F8F7FC`, dark `#1F1F1F`–`#202020` |
| Icon | centred 20 below button top (y 815); medium weight ≈ 22.67pt: house.fill ink 27.3 × 24, person.fill 19 × 20.3, magnifyingglass 22.3 × 22.3 |
| Title | 10pt, 12pt line, top at +35 (y 830); **semibold** selected / **medium** others; selected = accent `#0088FF`, others label |
| Search tab (search role) | rendered **inside the pill** as the 4th item with ≤ 3 other tabs (aux 48 × 48 view at x 326 hidden) |
| Badge | 18.33 × 18.33 at (167.33, 797): slot centre + 8.67, button top + 2; `#FF383C` (systemRed); "3" 12pt medium white |

## Toolbar (`toolbar-bottom` screen)
| What | Value |
|---|---|
| Items | **48 × 48** glass circles at x 28 and 326, y 798 → 846 (**28** from the screen sides and bottom) |
| Item host | 38 × 36 inset 5 / 6 inside the circle; symbols at large scale (folder ink 24.3, square.and.pencil 21.3) |
| Status | glass capsule 54.67 × 48 centred (x 173.67); text caption 12pt label, host 44.67 → padding 5 |
| Scroll pocket | backdrop blur 748 → 874 |

## SearchField (`nav-search` screen)
| What | Value |
|---|---|
| Capsule | **346 × 48** at x 28, y 798 (28 from sides/bottom, same as Toolbar) |
| Text field | 28 tall, vertically centred (y 808) |
| Magnifier | x 40 (12 in), 20.67 wide; 17pt medium (ink 16.3 × 16.7) |
| Prompt | x 68.67 (+8 after the glyph), 17pt **medium**, secondaryLabel (`#3C3C43` @ 0.6) |
| Glass | same rim/highlight as the bar buttons |

## SegmentedControl (`segmented` screen)
| What | Value |
|---|---|
| Track | **32** tall (lays out at 31), radius 16; light `#EEEEEF`, dark `#1C1C1F` (= tertiarySystemFill) |
| Segments | equal widths (370 / n: 185, 123.33, 74), no separators |
| Thumb | segment − 2 each side, 28 tall, radius 14; light white, dark `#5A5A5F` (≈ systemGray2) |
| Labels | 13pt (15.67 line), **medium** selected / regular others, label colour, centred (y + 8.33) |
| Icon segments | list.bullet 21 × 15, square.grid.2x2 19.33 × 18 at 17pt |
| Disabled | whole control alpha **0.5** |
| Stack spacing | 20 → controls at y 62, 113, 164, 215, 266 |

## PageControl (`page-control` screen)
| What | Value |
|---|---|
| Row | 25.67 tall, radius 12.83; padding-inline **14**; 12 above the pager bottom |
| Dots | **9.67** diameter, 8 apart (step 17.67) |
| Bare | current white, others white @ **0.45** |
| With background | thin material: light `#F5F5F5`, dark `#1F1F1F`; current white, others label @ **0.25** (`#B8B8B8` / `#575757`) |
