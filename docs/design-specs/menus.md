# Menus: design specs

Design values for pull-down menus, submenus and context menus. Points, @3x reference screen (402 × 874).

## Pull-down menu, rich (`menu-rich` screen)
| What | Value |
|---|---|
| Panel | 250 wide at (16, 62), corners ≈33, padding 10.5 top / 9.5 bottom (unchanged from `menu`) |
| Surface | light `#FEFEFE` centre, `#FAFAFA` toward the rim (vignette); dark `#202020` |
| Medium palette (`layout="medium"`) | 3 equal cells across 234 (8 inset each side, 78 per cell); block 56.5 tall: icon (17pt, `doc.on.doc` ink 17 × 21) centred 17.7 below the block top, label caption1 12pt **medium**, cap top 33.25 + 3 below block top, label colour |
| Divider | 21 block, 1pt `separator` line at +10, inset 24 (x 40–242) — same as `menu` |
| Section title | footnote 13pt **medium** (`Sort By` ink 44.6 wide), block 28.7 tall (cap top 5 below the divider block), x = no-icon title x |
| Checkmark column | reserved for the whole menu as soon as one item is checkable: titles +16 (no icon 28.5 → 44.5, 43.1 ink-corrected; with icon 64 → 80); `checkmark` ink 10.7 × 10.3 centred 27.7 from the panel edge (≈12pt semibold) |
| Icon column | per item, not per menu: items without an icon start their title at 28.5 (no checks) / 43.1 (checks); with an icon, icon centre 40 / 55, title 64 / 80 |
| Rows | 42 (text line 20.33 with 10.83 above and below); body 17 |
| Subtitle | footnote 13 regular (`Largest first` 71.7 wide), 2.3 below the title line; row grows to 59.6 |
| Secondary ink (section titles, subtitles, title) | light `#989898` = label 40 %; dark `#6D6D6D` on `#202020` = label 34.5 % (not `secondaryLabel`) |
| Disabled | light `#B1B1B1` = label 30 %; dark `#535353` = label 23 % — icon and title alike |
| Destructive | systemRed light `#FF383C`, dark `#FF5659` |
| Submenu chevron | `chevron.forward` ink 6.3 × 10.7 (≈12pt semibold), trailing ink edge 27 from the panel edge, vertically centred on the title line |

## Submenu drill-in (`menu-rich-sub` screen)
| What | Value |
|---|---|
| Parent | scales to 0.968 (250 → 242.3) from its top-leading corner; its content fades to 50 % (Name `#0A0A0A` → `#848484`) |
| Submenu panel | same 250 width and corners, x 16, y 350.3 → 516.3; header row centred on the scaled parent row (both at y ≈ 382.3) |
| Header row | icon (centre 40) + title 17 **semibold** (`Group By` 72.3 vs 69.7 regular) + `chevron.down` (10.7 wide, trailing edge 25.7 from the panel edge); 41.3 tall |
| Header divider | 20 block, line at +9.7 (y 412.3) |
| Children | normal 42pt rows; no icons → title at 28.5 |

## Context menu (`context-menu` screen)
| What | Value |
|---|---|
| Tile | 180 × 180, radius 24 continuous, gradient `#FF9F0A` → `#FF375F` top-leading to bottom-trailing, 24 below the safe area |
| Lifted preview | 206 × 206 (× 1.144), corner profile ≈ 27.5 circular-equivalent; centred horizontally on the tile; top clamped to safe area + 16 (78, not the natural 73) |
| Preview shadow | light: `#AEAEAE` at the edge on `#CCCCCC`, fading over ≈40 → Gaussian σ 25, α 0.29 (`drop-shadow(0 0 25px rgb(0 0 0/.29))`); invisible on black |
| Background | `--dph-scrim` (white → `#CCCCCC`, black stays black); blur 12px |
| Menu panel | 250 wide, centred on the preview (x 76 → 326), 16 below it (y 300 → 560); light surface `#EDEDED` over the scrim = label 7 % (denser than the pull-down), dark `#202020` |
| Glass glow | the preview bleeds into the top of the panel: dark `#5F3029` at +1, `#3D231E` at +20, `#32211F` at +40; light `#FFE4DC` → `#F4EBE9`. Fitted as a blurred copy of the preview (σ 40) under the content at 85 % (dark) / 22 % (light) |
| Title | `Sunset.jpg` footnote 13 medium, secondary ink, x 28.5; block 39.7 (cap top 22.7 below the panel top) |
| Small palette (`layout="small"`) | 4 cells of 58.5 across 234; icons only, 17pt, centred at +66.2 from the panel top; block 31.6 |
| Rows / dividers | same as the pull-down (42 rows, 21 divider blocks, inset 24) |
