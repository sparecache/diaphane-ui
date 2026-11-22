import { useId, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import type { ChartTint } from "./Chart";
import "./Card.css";

export type CardVariant = "groupBox" | "grouped" | "glass";
/** Category colours for the title symbol (the same names as Media tones, plus the accent). */
export type CardTint = ChartTint;

export interface CardProps {
  /** groupBox: plain group box (secondary background, 8pt corners). grouped: a card on a grouped Screen
   *  (secondary grouped background with inset-grouped section corners). glass: glass panel, 26pt corners. */
  variant?: CardVariant;
  /** Headline label above the content (GroupBox("Title")). */
  title?: string;
  /** Symbol before the title (Label(title, systemImage:)). */
  icon?: IconName;
  /** Colour of the title symbol (the title text stays primary). Default accent. */
  tint?: CardTint;
  /** Card content. */
  children: ReactNode;
  /** Makes the whole card tappable (e.g. push a detail page); it scales down slightly while pressed. */
  onPress?: () => void;
  testId?: string;
}

/** Content container that groups related information: GroupBox look, or a glass panel. */
export function Card({ variant = "groupBox", title, icon, tint = "accent", children, onPress, testId }: CardProps) {
  const titleId = useId();
  return (
    <section
      className="dph-card"
      data-variant={variant}
      data-tint={tint}
      aria-labelledby={title ? titleId : undefined}
      data-pressable={onPress ? "" : undefined}
      role={onPress ? "button" : undefined}
      tabIndex={onPress ? 0 : undefined}
      onClick={onPress}
      onKeyDown={onPress ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPress(); } } : undefined}
      data-testid={testId}
    >
      {title && (
        <h3 id={titleId} className="dph-card__title">
          {icon && <span className="dph-card__icon" aria-hidden="true"><Icon name={icon} weight="semibold" /></span>}
          <span>{title}</span>
        </h3>
      )}
      <div className="dph-card__content">{children}</div>
    </section>
  );
}
