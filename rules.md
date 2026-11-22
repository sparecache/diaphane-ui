# diaphane-ui rules: mobile design system

These rules are for screens built with this design system. Use only the catalog components named here.
This design system uses a translucent glass look: bars and floating controls are glass and sit over scrolling content.

## Structure
- Wrap every screen in `Screen`. Put the stack header in `header` and the tab bar or toolbar in `bottomBar`; `Screen` adds the safe areas, so never add your own top or bottom padding.
- Use `background="grouped"` for settings, forms, detail pages and cards. Use `plain` for content feeds (mail, messages, contacts).
- Use `TabBar` for top-level navigation between 2–5 sections. Keep one `TabBar` per app and never hide it on top-level screens.
- Put search in the `TabBar` (`searchPlacement="inline"`) when search is a top-level destination. Otherwise put `SearchField` in the `bottomBar` (`placement="bottomBar"`).
- Use `NavigationBar` for every pushed screen. Give top-level screens `displayMode="large"`; pushed screens get `displayMode="inline"` with `backLabel` + `onBack`.
- Keep navigation bar actions to at most two per side. Text actions ("Edit", "Done") become glass capsules; icon actions become glass circles and merge into one group.
- Use `NavigationBar` `subtitle` for secondary status ("12 unread"), never a second title row.
- Use `List` with `ListSection` and `ListItem` for any vertical collection. `insetGrouped` is for settings and detail; `plain` is for feeds.
- Navigate with `ListItem accessory="chevron"` and `onPress`. Never use a `Button` to push a screen.
- Show a record's fields as `ListItem` rows with `title` + `value` (label left, value right).
- Use `Toolbar` for screen-level actions at the bottom (compose, filter) when the screen has no `TabBar`.
- Use `SegmentedControl` to switch between 2–5 views of the same content, placed under the `NavigationBar`.
- Use `PageControl` only for paged carousels and onboarding.
- Give media apps a `TabBar` `accessory` (mini player) and `minimizeBehavior="onScrollDown"` so the bar collapses while reading.
- Use `List variant="grouped"` only to match legacy full-width grouped screens; prefer `insetGrouped`.
- Use `Card` for dashboards and summaries on grouped backgrounds; use `variant="glass"` only over imagery or color.
- Put leading identity in `ListItem` `leading` (an `Avatar`); use `prominent` for message-style rows.
- Use `Text` for standalone copy: `largeTitle` only via `NavigationBar`, `title2`/`title3` for in-page headings, `body` for copy, `footnote` for fine print.

## Actions
- Use exactly one prominent action per screen: `Button variant="borderedProminent"` in content, or `glassProminent` when it floats over content.
- Use `bordered` or `glass` for secondary actions, and `borderless` for tertiary, inline actions.
- Use `size="large"` with `fullWidth` for a bottom call to action ("Continue", "Place Order"), placed at the end of the content.
- Use `role="destructive"` for delete or remove actions, and `role="cancel"` for the dismissive choice.
- Use `IconButton` for icon-only actions (add, share, more, close). Always give it a `label`.
- Use `Menu` for 3+ related actions behind one control ("…" or "Sort"). Put destructive items last and separate them with a divider.
- Use `ActionSheet` to choose among actions triggered by the user, especially when one is destructive.
- Use `ContextMenu` for secondary actions on content (photos, messages, files) opened by touch and hold; never hide the only path to an action in it.
- In `Menu`, use `checked` for toggled options, section titles for groups, at most one level of submenu, and `layout="medium"`/`"small"` for a top row of 3–4 frequent actions.
- Put swipe actions on `ListItem` (`trailingActions` for delete/archive, `leadingActions` for pin/unread); keep 1–3 per edge and mirror them in a `ContextMenu` or `Menu`.
- Use `ListItem role="action"` for an in-list action and `role="destructive"` for "Sign Out" or "Delete Account" rows at the end of a list.
- Show work in progress with `Button loading`, not by disabling the button and adding a separate spinner.
- Write labels as short verbs in title case ("Save", "Add Photo"), never "OK" for a destructive action.

## Forms
- Build forms with `Form` + `ListSection`. Group related fields per section and give each section a short sentence-case `header`.
- Use `TextField variant="form"` inside a `Form`. Use `roundedBorder` only outside lists. Use `plain` only inside custom layouts.
- Set `type` for the keyboard and semantics: `email`, `password`, `tel`, `number`, `search`.
- Show helper text with `ListSection footer` or `FieldHint`. Show validation with `TextField invalid` + `errorText`, or `ListSection footerError`.
- Use `Toggle` (`ListItem accessory="toggle"` in lists) for on/off settings that apply immediately.
- Use `Picker variant="menu"` for one choice from 3+ options in a form row. Use `variant="segmented"` for 2–4 short options.
- Use `ListItem accessory="checkmark"` rows for single selection on a pushed screen, and `Checkbox` / `ListItem selectable` for multi-select.
- Use `DatePicker` compact in form rows, `variant="graphical"` when the calendar is the screen's focus, and `wheels` for times and countdowns; `Stepper` for small integer counts, `Slider` for continuous values.
- Use `Picker variant="wheel"` for 1–3 columns of ordered values and `navigationLink` for long option lists on a pushed screen.
- Submit with the `NavigationBar` trailing action ("Done", `glassProminent`) on sheets and edit screens, or with a large `Button type="submit"` at the end of long forms.
- Mark optional fields "Optional" via `placeholder`. Never mark required fields with asterisks.

## Feedback
- Use `Screen` `onRefresh` + `refreshing` for pull to refresh on feeds; never add a separate "Refresh" button.
- Show loading with `ProgressView`: `circular` while waiting, `linear` with `value` when progress is known. Keep the real layout around it.
- Show empty content with `EmptyState`, with an icon, a title, a one-sentence description and at most one action. Use `variant="search"` for empty search results.
- Show failures with `ErrorState` and a retry action. Show inline field errors with `FieldError`.
- Use `Alert` only to confirm consequential or destructive actions, or to report blocking errors. Use two actions, with cancel first.
- Use `Banner` for transient, non-blocking confirmation ("Saved", "Copied"). Never use `Banner` for errors that need action.
- Use `Sheet` for focused subtasks (compose, edit, filters) with `NavigationBar`-style cancel/confirm. Use `detent="medium"` for short pickers and `large` for editing.
- Use `Badge` on tab items and rows for unread counts only, never for status words longer than a few letters.
- Use `Gauge` for a single bounded metric (battery, storage, rings).

## RTL
- Use logical props only; every component already mirrors under `dir="rtl"`.
- Use semantic directional icons (`chevron.forward`, `chevron.backward`, `arrow.forward`) for direction so they flip automatically.
- Never mirror media controls, clocks, charts, logos or phone numbers.
- Keep numbers and Latin product names in their natural order inside RTL text.
- Test every screen with `dir="rtl"` and the pseudo-locale (40% longer strings); text wraps rather than clips.

## Accessibility
- The default palette is the standard palette. Set `Frame contrast="high"` (or `data-contrast="high"`) when WCAG AA contrast is required; every text pair passes there.
- Give every `IconButton`, standalone `Icon` and hidden-label control a `label`.
- Keep touch targets at least 44pt. Never shrink `Button` or `IconButton` below `size="small"`.
- Test with `Frame textSize` from xSmall to AX5; text and list rows scale, and long titles wrap rather than truncate.

## Don't
- Never use `className`, `style` or raw colors; customise only through props and `--dph-*` tokens.
- Never hardcode text inside components; pass every string through props.
- Never nest a `List` inside a `Card`, a `Sheet` inside a `Sheet`, or a `TabBar` inside a `Sheet`.
- Never use more than one `TabBar` or more than one prominent `Button` on a screen.
- Never put a `Button` in a `ListItem`; use `ListItem` `role` or `accessory` instead.
- Never use `Alert` for success messages or `Banner` for confirmations that need a decision.
- Never use uppercase section headers; headers are sentence case.
- Never fake loading, empty or error states with plain `Text`; use `ProgressView`, `EmptyState`, `ErrorState`.
- Never use hamburger menus, floating action buttons or Android-style snackbars; use `TabBar`, `Toolbar` + `IconButton`, and `Banner`.
