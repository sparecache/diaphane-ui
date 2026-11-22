# Layout & display: design specs

Design values for lists, selection, cards and badges. Points, @3x reference screen (402 × 874).

## Plain list (`list-plain` screen)
| What | Value |
|---|---|
| First section header frame | y 84 (safe top 62 + **22**), 402 × 40.33; text at y 94 (**10** top, 10 bottom) |
| Second section header | y 458.33 = previous section end 436.33 + **22** |
| Text rows | 52 tall, text x 16, body 20.33 line |
| Separators | x **16 → 386** (trailing 16pt margin, not full-bleed), 1pt, `#3C3C43` @ 0.12 light; **also under the last row** of each section |
| Avatar row | 70.33 tall; avatar 40 × 40 at x 16, vertically centred (y + 15.17) |
| Avatar → text | 12 (text x 68); separator starts at **68** |
| Avatar title / subtitle | headline 20.33 + 2 + subheadline 18 (secondary) |
| Trailing time | subheadline, secondary, right edge 386, vertically centred |
| Avatar fill | grey gradient, top→bottom: y+2 `#ADADB1`, 50% `#96979C`, ≥ 80% `#8E8E93` (= systemGray); identical light/dark |
| Initials | 16pt medium white (0.4 × size), frame 22.67 × 19.33 |

## Selection (`list-selection` screen, edit mode, inset grouped)
| What | Value |
|---|---|
| First header | y 62 (safe top), 40.33; rows from 102.33 |
| Header after a footer-less section | 17.33 below the rows (rows end 310.33 → header text 338, rows 368) |
| Selection circle | 22pt, x 37–59 (**21** from the section edge), vertically centred; ring 1.5pt tertiaryLabel; selected = accent `#0088FF` + bold white check |
| Text after circle | x 76 (60 from section edge) |
| Selected row fill | systemGray4 (`#D1D1D6` light, `#3A3A3C` dark) |
| Separators | hidden on a selected row and on the row above a selected row |
| Checkmark rows | text x 36; checkmark 15 × 14.67 at x 349; separators 36 → 366 |

## Card (`card` screen)
| What | Value |
|---|---|
| Group box | x 16–386, padding 16, fill secondarySystemBackground (`#F2F2F7` light = invisible on grouped bg, `#1C1C1E` dark) |
| Group box corners | ≈ 8pt (row offsets 6.3 / 3.7 / 1.3 / 0.3 at 1/3, 1⅓, 3⅓, 6⅓pt) |
| Group box with title | 96.67 tall = 16 + headline 20.33 + 2 + body 2 lines (22pt apart, 42.33) + 16 |
| Multi-line body | lines 22pt apart (body leading), frame trims the half-leading top/bottom; avoid a one-word last line |
| Group box with label | 52.67 tall; gearshape ink x 33.3–51.3, title x ≈ 61 |
| Stack spacing | 16 |
| Glass card | 370 × 80, radius 26; fill light `#F8F8FD` on `#F2F2F7` (brighter than `--dph-glass-fill`), dark `#202020`; light: white inner rim + soft shadow; dark: lighter 1px perimeter rim |
| "Badges" headline | 16 below the glass card |
| Badge | 20pt tall capsule; "3" = 20 × 20 (6pt padding), "New" = 40 × 20 (7pt padding); caption1 semibold white; red `#FF383C` (systemRed), accent `#0088FF`; 12 apart |
