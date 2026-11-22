# Inputs: design specs

Design values for form rows, text fields, sliders, steppers, pickers and toggles. Points, @3x reference screen (402 × 874).

## Form rows (`form-controls`, `textfields-form` screens)
| What | Value |
|---|---|
| Row padding | 20 inline (content x 36 → 366), separators 36 → 366, 1pt `#3C3C43@0.12` / `#545458@0.5` |
| Vertical inset for controls | **15** above and below: TextField 22 → 52, Slider 31 → 61, segmented 31 → 61, date pill 34.33 → 64.67, time pill 36 → 66 |
| Stepper row | 52 (stepper 32 at row + 10) |
| Menu Picker row | 52 (button 34.33 at row + 9) |
| Multiline TextField (lineLimit 3…5) | text view 64.33 tall (3 × 21.44) → row 94.33; placeholder at row + 15 |
| Footer (error) | header/footer view 29.67: 8 + footnote 15.67 + 6; text x 36; next header follows with no gap |
| Section gap after a footer-less section | next header frame +17.67; headerless section +35 |
| Placeholder | placeholderText `#3C3C43@0.298` / `#EBEBF5@0.298` |
| LabeledContent (Phone) | label at x 36, field x 92.33 → 366, text trailing-aligned |
| SecureField | 8 bullets 7.33 × 7.33, pitch 10.25; WebKit's password bullets match with no tracking |

## Standalone text fields (`textfields-standalone` screen)
| What | Value |
|---|---|
| roundedBorder | 370 × 34, radius 5, border 0.33 `#000@0.2` / `#FFF@0.2` (label 20%), fill systemBackground, text inset 7 |
| plain | 22 tall |
| Search capsule | 370 × 44, padding 12, magnifyingglass (17pt regular, secondaryLabel) → 8 → field x 56.33 → 8 → mic.fill; glass `.regular` |
| Spacing | Stack 16 (fields at y 62, 112, 162, 200) |

## Slider (`sliders`, `form-controls` screens)
| What | Value |
|---|---|
| Control | 31 tall |
| Track | 6 tall, radius 3, at y + 12.5; `#000@0.1` / `#FFF@0.1` (label 10%) |
| Track ink | 17.5 device px starting between pixels (≈ y + 12.58) → `translateY(0.583px)`, height 5.833 |
| Fill | accent (`#0088FF` / `#0091FF`); width = knob centre (`p·(W−37)+18.5`), 0 at min, full at max |
| Knob | 37 × 24 at y + 4, x = p·(W−37), white, capsule; shadow (0, 1) r 5 @0.14 |
| Disabled | whole element alpha 0.5 |
| Min/max symbols | speaker.fill (16.88 wide) / speaker.wave.3.fill (27.34 wide), 17pt label color, 8 from the track (slider 41 → 350.33) |
| Stepped (step 0.25) | no tick marks drawn |
| Stack spacing | 28 (sliders at y 62, 121, 180, …) |

## Stepper (`sliders`, `form-controls` screens)
| What | Value |
|---|---|
| Frame | 94 × 32; halves drawn at x 0.67–47 and 47–93.67 (capsule) |
| Fill | `#3C3C43@0.086` / `#EBEBF5@0.078` = quaternaryLabel × 49% |
| Divider | 1 × 24 at x 46.67, y 4, radius 0.5, tertiaryLabel (`@0.298`) |
| Glyphs | minus 13.33 × 2 at (17, 15); plus 13.33 × 13.33 at (63.67, 9.33), 2pt bars, label color |
| Can't-step half | glyph tertiaryLabel (`#B9B9BC` on `#EEEEEF`, `#535356` on `#121213`) |

## Picker
| What | Value |
|---|---|
| Menu button | 64.33 × 34.33 at x 301.67; value label x 313.67 (12 leading inset), 17pt secondaryLabel; 4 gap; chevron.up.chevron.down box 12.33 × 14.67 (small scale), secondaryLabel; trailing edge = content edge 366 |
| Segmented host | 330 × 31 (control 32, radius 16), track tertiarySystemFill, lens 106 × 28 inset 2 (white / `#EBEBF5@0.3`), labels 13pt (selected medium) |

## DatePicker compact (`form-controls` screen)
| What | Value |
|---|---|
| Date pill | 123.67 × 34.33, radius 17.17, tertiarySystemFill (`#767680@0.12` / `@0.24`), label 12 × 7 inset, 17pt label color |
| Time pill | 70 × 36, radius 18, label 46 × 22 (12 × 7 inset) |
| Formatting | `en-GB` medium date / short time → "20 Nov 2026", "14:00"; the playground's fixed date is 2026-11-20 **10:00 UTC** |

## Toggle
| What | Value |
|---|---|
| Disabled switch | alpha 0.5 (Toggle.css matches) |
| Disabled row label | stays **label** color (black/white), not tertiary |
| Layout width | the switch is laid out 61pt wide and drawn 63 (overhangs 2pt past the content edge: x 305 → 368 with content edge 366) |
