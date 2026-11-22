# Glass: design specs

The glass look used by `Glass`, `Button`, `IconButton`, `TabBar`, `Toolbar`, `SearchField` and the bar surfaces. The
values below are this library's design values; the CSS recipe lives in `src/styles/tokens.css` and
`src/components/Glass.css`.

## Glass control at rest (Button `.glass`, 75 × 34.33pt)
| Part | Value |
|---|---|
| Backdrop blur | **5** device px (≈ 0.8pt σ: stripes stay sharp through the glass) → `blur(0.5px)` in `--dph-glass-backdrop` |
| Shape | corner radius 17.167 (h/2), continuous curve |
| Edge falloff | maximum 8.89pt |
| Rim light | key light angle 0 (top), fill light angle π (bottom), both white, amount 0.5, spread 1.396 rad (80°), diffuse amount 0.15, curvature 0.75 |
| Label | vibrancy colour matrix |

There is no outline. The rim is light from the top and bottom highlights, so the unlit sides read darker. `--dph-glass-rim` reproduces this with side shading, top and bottom specular insets and an inner diffuse band, with no hard ring.

## Glass control pressed
- Whole control `transform` scale **1.2133** (91 × 41.66pt from 75 × 34.33), label included.
- Glow container: a white layer through a vibrancy colour matrix, which whitens the surface.
- Finger glow: 62.5pt white glow centered under the finger, shadow radius 25.75, opacity 1.

## Switch knob / slider thumb pressed
| Part | Value |
|---|---|
| Lens frame | **58 × 38.333pt**, centered on the 37 × 24 knob |
| Backdrop filters | displacement amount **9** + blur radius **0**: clear glass, no blur |
| Signed-distance displacement | height 36, curvature 1 |
| Edge refraction | displacement **−17.5** over distance height 11.2: pulls the surroundings ≈3pt inward |
| Backdrop blur | 0; edge falloff max 8.95 |
| Shadow | black, offset (0, 7), radius 3, opacity 0.06 |
| Highlights | same key/fill effect as above |

CSS can't displace the backdrop in WebKit, so the switch draws the refraction geometrically. The lens is clear glass, and an `::after` shows the track as it appears through the lens: 22.67pt tall, flush with the track side, with a dark refraction edge. The slider draws the track magnified ×1.5 inside the lens.

## Resting switch
- Track: 63 × 28, corner 14 `continuous`; off-track color (60, 60, 67) @ 0.298.
- Knob: 37 × 24, white.

## Scroll indicator
- 3pt wide, 3pt from the trailing edge; light mode black @ 0.35 (`#A6A6A6` on white), dark mode white @ 0.5 (`#808080` on black).
- Visible while scrolling and while a finger is down; fades out after release. Rendered by `Screen` (`.dph-screen__indicator`). Browser scrollbars are hidden inside `[data-ds]`.

## Glass levels over busy content (`glass-lab`, `glass-levels` screens)
Values for 170 × 56 capsules over 12pt black/white stripes and 30pt colour bands. Plain white or black backgrounds hide
almost all of this, so check glass over busy content (the `glass-lab` and `glass-levels` playground screens).

| Level | Over black / white stripes (light) | Dark | Over colour |
|---|---|---|---|
| `.regular` | 192 / 225 (on plain white: 249) | 89 / 138 (on plain black: 31) | colour kept: blue band → (108, 209, 255) |
| `.clear` | 32–51 / 255 | same | red (255, 59, 48) → (255, 84, 72): 12.5% white |
| `.regular.tint(.blue)` | (0,120,230) / (0,129,243) | (10,148,253) / (20,152,251) | ~95% tint |
| `.clear.tint(.blue)` | (0,86,173) / (0,136,255) | (0,92,173) / (0,145,255) | tint × (0.65 + 0.35·L) |

`.regular` is adaptive: its brightness follows the surrounding backdrop (249 on white, 192–225 on mixed content), which a
per-pixel CSS filter cannot do. The tokens use one curve per appearance, exact on plain backgrounds and close on mixed content:
- light `--dph-glass-backdrop: blur(0.5px) contrast(0.1261) saturate(4) brightness(1.705)`: 190 → 245, chroma ×0.86
- dark `blur(0.5px) contrast(0.5278) saturate(2.6) brightness(0.72)`: 43 → 140, chroma ×1

Contrast is compressed before saturating, so colours never clip (saturating first washed the bands out to pastel).
`Glass` exposes `regular` / `clear`, `tint`, `shape` and `interactive`.

## Edge refraction
The glass pulls the content just beyond the rim inward (the `.clear` end caps show the next stripe out, bent along the
curve). `src/components/glassRefraction.ts` builds an SVG `feDisplacementMap` per glass size and radius (band ≈ r,
capped at 24pt; reach r/2 outward, falling off as t²), applied through `--dph-glass-refraction` ahead of the backdrop
filter. Browser support:
- **Chromium** (Chrome, Edge, Arc): refraction renders.
- **Safari / WebKit**: `backdrop-filter: url()` parses but draws nothing, so the runtime stays off (detected through
  `navigator.userAgentData`). You get the tone-mapped glass without the bend.
