import { useId } from "react";
import { Icon } from "./Icon";
import "./Checklist.css";

export interface ChecklistItem {
  title: string;
  subtitle?: string;
  done: boolean;
  /** Opens the step (e.g. push its settings page). Without it, tapping toggles the step. */
  onPress?: () => void;
}

export interface ChecklistProps {
  /** Card title, e.g. "Finish Setting Up". */
  title: string;
  /** Formatted progress line, e.g. "2 of 5 complete". */
  progressLabel: string;
  items: ChecklistItem[];
  /** Called with the step index when a step without onPress is tapped. */
  onToggle?: (index: number) => void;
  /** Hide finished steps (they still count in the progress bar). */
  hideCompleted?: boolean;
  testId?: string;
}

/** Setup / onboarding checklist card: title, progress bar, and steps with check circles (onboarding style). */
export function Checklist({ title, progressLabel, items, onToggle, hideCompleted, testId }: ChecklistProps) {
  const id = useId();
  const done = items.filter((i) => i.done).length;
  const shown = items.map((it, i) => [it, i] as const).filter(([it]) => !hideCompleted || !it.done);
  return (
    <section className="dph-checklist" aria-labelledby={id} data-testid={testId}>
      <header className="dph-checklist__header">
        <h3 id={id} className="dph-checklist__title">{title}</h3>
        <span className="dph-checklist__progress-label">{progressLabel}</span>
        <span className="dph-checklist__bar" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} aria-label={progressLabel}>
          <span style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
        </span>
      </header>
      <ul className="dph-checklist__items">
        {shown.map(([it, i]) => (
          <li key={i}>
            <button type="button" className="dph-checklist__item" data-done={it.done || undefined} aria-pressed={it.onPress ? undefined : it.done} onClick={() => (it.onPress ? it.onPress() : onToggle?.(i))}>
              <span className="dph-checklist__check" aria-hidden="true">{it.done && <Icon name="checkmark" weight="bold" scale="small" />}</span>
              <span className="dph-checklist__text">
                <span className="dph-checklist__item-title">{it.title}</span>
                {it.subtitle && <span className="dph-checklist__item-subtitle">{it.subtitle}</span>}
              </span>
              {it.onPress && <Icon name="chevron.right" weight="semibold" scale="small" />}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
