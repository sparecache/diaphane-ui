import type { ReactNode } from "react";
import "./Stack.css";

export type StackDirection = "vertical" | "horizontal";
export type StackSpace = "none" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type StackPadding = "none" | "margin" | "inline" | "1" | "2" | "3" | "4" | "5" | "6";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between";

export interface StackProps {
  children: ReactNode;
  /** VStack / HStack. */
  direction?: StackDirection;
  /** Gap between children on the --dph-space-* scale (4pt steps up to 40pt). */
  gap?: StackSpace;
  /** Inner padding: `margin` = the 16pt screen margin on all sides; `inline` = 16pt leading/trailing margins only. */
  padding?: StackPadding;
  align?: StackAlign;
  justify?: StackJustify;
  /** Let children wrap onto new lines (horizontal stacks). */
  wrap?: boolean;
  /** Fill the remaining space of a parent stack (Spacer-like). */
  grow?: boolean;
  /** Horizontal ScrollView: children scroll sideways and snap (.scrollTargetBehavior(.viewAligned)); use with direction="horizontal". */
  scroll?: boolean;
  /** Width of each child in a scrolling stack, in points (e.g. 280 for cards, 140 for tiles). */
  itemWidth?: number;
  testId?: string;
}

/** Layout primitive: spacing and margins from tokens, so screens never need custom CSS. */
export function Stack({ children, direction = "vertical", gap = "3", padding = "none", align = "stretch", justify = "start", wrap, grow, scroll, itemWidth, testId }: StackProps) {
  return (
    <div
      className="dph-stack"
      data-direction={direction}
      data-gap={gap}
      data-padding={padding}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap || undefined}
      data-grow={grow || undefined}
      data-scroll={scroll || undefined}
      style={scroll && itemWidth ? { ["--_item" as string]: `${itemWidth}px` } : undefined}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
