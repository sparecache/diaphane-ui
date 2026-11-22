import type { ReactNode } from "react";
import "./Text.css";

export type TextVariant =
  | "largeTitle" | "title1" | "title2" | "title3" | "headline" | "body"
  | "callout" | "subheadline" | "footnote" | "caption1" | "caption2";
export type TextColor = "primary" | "secondary" | "tertiary" | "quaternary" | "accent" | "danger" | "success" | "warning" | "onAccent" | "inherit";
export type TextWeight = "regular" | "medium" | "semibold" | "bold" | "heavy";

export interface TextProps {
  /** Text content. */
  children: ReactNode;
  /** Text-size style. */
  variant?: TextVariant;
  /** Hierarchical label color. */
  color?: TextColor;
  /** Explicit weight; overrides the style's default and `emphasized`. */
  weight?: TextWeight;
  /** The "emphasized" variant of the style (semibold or bold, depending on size). */
  emphasized?: boolean;
  /** Type design: default system sans, rounded, or monospaced. */
  design?: "default" | "rounded" | "monospaced";
  align?: "start" | "center" | "end";
  /** Clamp to N lines with a trailing ellipsis (0 = unlimited). */
  lines?: number;
  /** Multi-line paragraph spacing (paragraph leading) instead of tight single-line metrics. */
  paragraph?: boolean;
  /** Semantic element to render. */
  as?: "span" | "p" | "h1" | "h2" | "h3" | "label" | "div";
  testId?: string;
}

/** Text in a dynamic-type style. */
export function Text({
  children, variant = "body", color = "primary", weight, emphasized, design = "default",
  align, lines = 0, paragraph, as: Tag = "span", testId,
}: TextProps) {
  return (
    <Tag
      className="dph-text"
      data-variant={variant}
      data-color={color}
      data-weight={weight}
      data-emphasized={emphasized || undefined}
      data-design={design === "default" ? undefined : design}
      data-align={align}
      data-lines={lines > 0 ? lines : undefined}
      data-paragraph={paragraph || undefined}
      data-testid={testId}
      // Line clamp count is data, not styling: passed through a CSS variable.
      {...(lines > 0 ? { style: { ["--dph-lines" as string]: lines } } : {})}
    >
      {children}
    </Tag>
  );
}
