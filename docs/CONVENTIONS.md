# diaphane-ui build conventions

The contract every component follows. The design values (sizes, radii, colours, motion) live in
`src/styles/tokens.css` and in the per-area notes under `docs/design-specs/`; those notes are this library's own specs.

## Ground rules (non-negotiable)
- React 19 + TS strict. One component per file in `src/components/<Name>.tsx`, named export = catalog name. CSS in `src/components/<Name>.css`, imported by the component.
- **All CSS scoped** under `[data-ds="diaphane"]`. No global selectors, no resets.
- Components read **only `--dph-*` variables**. No raw hex, px font sizes or radii **for themeable values** (colors, fonts, radii, spacing that's a token). Component geometry (e.g. `63px` switch width, `52px` row height) is fine as literal metrics or local `--_x` vars inside the component CSS.
- Variants are **string-literal unions**, no `any`. **No text inside components**; all visible text from props. No `className`/`style` props for consumers (internal `style` for CSS custom properties is OK). No data fetching/routing/state ownership; interactions are callbacks (`onPress`, `onChange`).
- **Logical CSS only**: `margin-inline-start`, `inset-inline-end`, `padding-inline`, `text-align: start`. Never `left`/`right` (also not in `transform-origin` keywords, use `inset-inline`).
- Directional icons flip under RTL. `Icon` already does this for icons flagged flippable (`chevron.forward`, `arrow.right`, …). Prefer the semantic `chevron.forward` / `chevron.backward` names.
- Touch targets ≥ 44pt (use an `::after` hit-area like `Button.css` when the visual is smaller).
- A11y: native elements or correct `role`; labels via props; `aria-disabled` / `aria-invalid` / `aria-checked` etc.; visible focus via `var(--dph-focus-ring)` on `:focus-visible`.
- Every component accepts `testId?: string` → `data-testid`.
- Text uses `--dph-font-*` tokens and must survive 40% longer strings (wrap or ellipsize, never clip mid-glyph).
- Loading / empty / error are props or components, never faked.

## Patterns already in place (copy them)
- Variants as `data-*` attributes on the root (`data-variant`, `data-size`, `data-role`), styled with attribute selectors. See `Button.tsx/.css`, `List*.tsx/List.css`.
- Typography: `font: var(--dph-font-body); letter-spacing: var(--dph-text-body-tracking);` (tracking is 0 because browsers apply the system font's own tracking). Line heights are snapped to the 1/3pt grid.
- Colors: every system/semantic colour exists as `--dph-<kebab-name>` in light, dark, high-contrast and dark-elevated (`src/styles/tokens.css`). Accent = `--dph-accent`. Glass: `--dph-glass-fill`, `--dph-glass-rim`, `--dph-glass-shadow`, `--dph-glass-prominent-rim`, plus `backdrop-filter: blur(var(--dph-glass-blur)) saturate(var(--dph-glass-saturate))`.
- Sheets/popovers/alerts in dark mode use the **elevated** level: put `data-level="elevated"` on the overlay root and the background tokens lift automatically.
- Icons: `<Icon name="square.and.arrow.up" weight="semibold" scale="small|medium|large" />`. Built-in glyphs come from `src/icons` (register extra ones with `registerIcons`); they are sized with `font-size` (17px = body) and baseline-aligned with the text. Set the icon's size by setting `font-size` on its container.
- Existing components you **use but do not edit**: `Text`, `Icon`, `Button`, `IconButton`, `Toggle`, `ProgressView`, `List`, `ListSection`, `ListItem`. If one needs a change, describe it in your final report (file, change, reason) instead of editing it.

## Build → verify loop (per component)
1. **Spec.** Write down the design values you will use (sizes, paddings, colours, radii, motion) in `docs/design-specs/<area>.md` before you start, and reuse existing `--dph-*` tokens wherever one fits.
2. **Build** the component in `src/components/<Name>.tsx` + `<Name>.css` and a playground screen in `playground/screens/<area>.tsx`. Register the screen in `playground/screens/index.tsx` (the id, group, title and the exact exported function name). Import components by path (`../../src/components/X`), not from the barrel. `.pg-ref` = white background + safe-area top + 16pt side padding; `.pg-ref.grouped` = grouped background, no side padding.
3. **Look at it.** Run `npm run dev` and open the playground (default http://127.0.0.1:5173). Check light and dark, `?dir=rtl`, the pseudo-locale toggle (40% longer strings) and `Frame textSize` from xSmall to AX5. Fix anything that clips, overlaps or fails to mirror.
4. **Typecheck:** `npm run typecheck`.
5. **Validate against the package spec:** `npm run validate` must report every check as passing (22/22). It catches unscoped CSS, physical `left`/`right`, `className`/`style` props, text inside components, missing `testId` and catalog ↔ export mismatches.
6. **Catalog:** add or update the entries in `docs/catalog-parts/<area>.json`, then run `npm run catalog` to regenerate `catalog.json`. Never edit `catalog.json` by hand.
7. **Done** when typecheck and validate pass, the catalog is regenerated, the playground screen renders correctly in light, dark and RTL, and the design-spec note matches what you built.

## Deliverables per area
- Components + CSS in `src/components/`.
- Playground screens in `playground/screens/<area>.tsx`.
- `docs/catalog-parts/<area>.json`: `{ "components": [ …catalog@1 entries… ] }` with props typed `enum|string|number|boolean|callback|icon|node|array`, text props `"i18n": true`, `slots`, one-sentence `use` and `avoid`, `a11y`, `category` (layout|navigation|action|input|display|feedback|overlay), `"since": "1.0"`, `"import": "diaphane-ui"`.
- `docs/design-specs/<area>.md`: the design values you used (sizes, paddings, colours, radii, motion) and the playground screen that shows them.
- Summary (≤ 250 words): components, anything you couldn't finish, requested changes to shared files.
