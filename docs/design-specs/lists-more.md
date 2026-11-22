# Lists & tab bar: grouped list, swipe actions, pull to refresh, tab bar accessory, minimized tab bar

Design values for the grouped list, swipe actions, pull to refresh, the tab bar accessory and the minimized tab bar.
All values in points, @3x reference screen (402 × 874).

## List `variant="grouped"` (`list-grouped` screen)
| Part | Value |
|---|---|
| Section | full width (no inset, no corner radius), rows `secondarySystemGroupedBackground` (#FFF / #1C1C1E) on `systemGroupedBackground` |
| Header | 40.33 tall, sentence case headline in secondaryLabel; text frame 10 below the header top (CSS 10.33 / 9.67 padding to match ink) |
| Section hairlines | full-width 1pt `separator` at the top of the first row and inside the bottom of the last row |
| Inner separators | from the text (16, or 56 = 16 + 40 with an icon tile) to 16 from the trailing edge |
| Icon tile | x = 13 (row padding 16 − 3), text at 56 |
| Footer | 8 above the text, 2-line footnote 31.67, section ends 45.67 below the rows (CSS bottom padding 5.67) |
| Next header | directly after a footer; a header-less section after a footer-less one starts 35 lower |

## Swipe actions (`list-swipe` screen, plain list, row height 70.33)
| Part | Value |
|---|---|
| Open offset | row slides by n × 70 + 10 (3 actions → 220) |
| Action | 60 wide, 10 apart, 10 from the row edge; first action at the edge (Delete outermost) |
| Capsule | height = row − 28 (42.33), 4.17 below the row top, radius = height / 2 (continuous) |
| Colors | Delete systemRed #FF4245 (dark), Flag systemOrange #FF9230, More systemGray #8E8E93; glyph white (trash.fill 19 × 21.3) |
| Label | 13pt regular, secondaryLabel, 4 below the capsule (frame 15.67) |
| Open row | background systemGray5 (#E5E5EA / #2C2C2E) with rounded ends (≈ 24 radius in CSS); its separator and the one above hide |

## Pull to refresh (`refresh` screen, plain list without a navigation bar)
| Part | Value |
|---|---|
| Content offset while refreshing | +60.33 (refresh control frame 60 at the safe-area top, y = 62) |
| Spinner | 30 diameter, centred in the band (centre y = 92); 8 spokes 3.77 × 10.04, radius 1.83, from 5 to 15 off centre, secondaryLabel |

## Tab bar accessory (`tabbar-accessory` screen)
| Part | Value |
|---|---|
| Accessory | 360 × 48 glass capsule at x = 21, bottom 8 above the 62pt pill (y 735–783; pill 791–853) |
| Content | supplied by the app; the mini player has 16 padding (tile at 37), so the slot pads 16 |
| Tab pill | unchanged from `tabbar` (21 from the sides and bottom) |

## Minimized tab bar (`tabbar-minimized` screen, `minimizeBehavior="onScrollDown"`)
| Part | Value |
|---|---|
| Selected tab | 48 glass circle, 28 from the leading edge and the bottom (x 28, y 798); icon accent, centred (top +10), no label, no selection capsule |
| Search | 48 glass circle 28 from the trailing edge (x 326) |
| Accessory | inline between them, 14 gap each side (x 90–312, 48 tall); the mini player title wraps to two lines |
| Bar slot | the bar keeps its 83pt frame (791–874), so the content inset does not change |
| Top edge | in a tab view, the inline navigation bar uses the **hard** scroll edge: blurred bar 0–116 with a 0.33pt rgba(0,0,0,0.1) hairline; `Screen topEdgeEffect="hard"` |

