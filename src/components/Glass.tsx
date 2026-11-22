import type { ReactNode } from "react";
import "./Glass.css";

export type GlassVariant = "regular" | "clear";
export type GlassShape = "capsule" | "circle" | "rect";
export type GlassTint = "accent" | "blue" | "green" | "indigo" | "orange" | "pink" | "purple" | "red" | "teal" | "yellow";

export interface GlassProps {
  /**
   * .regular (default): the backdrop shows through sharp with its brightness compressed and its colour kept,
   * legible over anything. .clear: almost untouched backdrop (12.5% white), for glass over media.
   */
  variant?: GlassVariant;
  /** Glass.tint(_:): colours the glass. Regular tint is nearly opaque; clear tint keeps the backdrop's shading. */
  tint?: GlassTint;
  /** in: .capsule (default), .circle, or .rect(cornerRadius:). */
  shape?: GlassShape;
  /** Corner radius for shape="rect", in points. Default 26 (glass cards). */
  cornerRadius?: number;
  /** Glass.interactive(): swells ×1.2133 on a spring and lights up while pressed. */
  interactive?: boolean;
  /** Content drawn on the glass. Size the glass with the content (or the parent's layout). */
  children?: ReactNode;
  testId?: string;
}

/**
 * A glass surface. Use it for custom floating controls and panels;
 * Button, IconButton, TabBar, Toolbar and SearchField already draw their own glass.
 */
export function Glass({ variant = "regular", tint, shape = "capsule", cornerRadius = 26, interactive = false, children, testId }: GlassProps) {
  return (
    <div
      className="dph-glass"
      data-variant={variant}
      data-tint={tint}
      data-shape={shape}
      data-interactive={interactive || undefined}
      style={shape === "rect" ? { ["--_radius" as string]: `${cornerRadius}px` } : undefined}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
