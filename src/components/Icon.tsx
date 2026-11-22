import { useId } from "react";
import { type IconName as BuiltInIconName } from "../icons/icons";
import { useIcon } from "../icons/registry";
import "./Icon.css";

/** Any icon name. Built-in names autocomplete; others render once registered with `registerIcons`. */
export type IconName = BuiltInIconName | (string & {});
export type IconScale = "small" | "medium" | "large";
export type IconWeight = "regular" | "medium" | "semibold" | "bold";
export type IconColor = "inherit" | "primary" | "secondary" | "tertiary" | "accent" | "danger" | "success" | "warning" | "onAccent";

export interface IconProps {
  /** Icon name, e.g. "square.and.arrow.up". See `icons` for the built-in set. */
  name: IconName;
  /** Icon scale relative to the surrounding text. */
  scale?: IconScale;
  /** Stroke weight; match the adjacent text weight. */
  weight?: IconWeight;
  color?: IconColor;
  /** Accessible label. Omit for decorative icons next to visible text. */
  label?: string;
  testId?: string;
}

/**
 * Icon sized and baseline-aligned to the surrounding text (24-unit grid, 1.17em box). Artwork is Lucide
 * (ISC licence); filled variants ("heart.fill") and knocked-out badges ("checkmark.circle.fill") are
 * composed from the same glyphs.
 */
export function Icon({ name, scale = "medium", weight = "regular", color = "inherit", label, testId }: IconProps) {
  const def = useIcon(name);
  const maskId = `${useId().replace(/:/g, "")}-cut`;
  const a11y = label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true as const };
  const html = def.cut
    ? `<defs><mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="#fff"/><g class="dph-icon__cut">${def.cut}</g></mask></defs><g mask="url(#${maskId})">${def.body}</g>`
    : def.body;
  return (
    <svg
      className="dph-icon"
      data-scale={scale}
      data-weight={weight}
      data-color={color}
      data-mirror={def.mirror || undefined}
      data-testid={testId}
      viewBox="0 0 24 24"
      focusable="false"
      {...a11y}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
