import "./PageControl.css";

export interface PageControlProps {
  /** Number of pages. */
  count: number;
  /** Zero-based index of the visible page. */
  current: number;
  /** Tapping a dot requests that page. */
  onChange?: (index: number) => void;
  /**
   * false: bare white dots for use over media/colour (TabView .page). true: dots in a thin-material capsule
   * (.indexViewStyle(.page(backgroundDisplayMode: .always))) for plain backgrounds.
   */
  background?: boolean;
  /** Accessible name of the control, e.g. "Page". */
  label?: string;
  testId?: string;
}

/** Page indicator dots. */
export function PageControl({ count, current, onChange, background = false, label, testId }: PageControlProps) {
  return (
    <div className="dph-page-control" role="group" aria-label={label} data-background={background || undefined} data-testid={testId}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          className="dph-page-control__dot"
          aria-label={`${i + 1}/${count}`}
          aria-current={i === current ? "page" : undefined}
          tabIndex={i === current ? 0 : -1}
          onClick={() => onChange?.(i)}
          onKeyDown={(e) => {
            const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
            const step = e.key === (rtl ? "ArrowLeft" : "ArrowRight") ? 1 : e.key === (rtl ? "ArrowRight" : "ArrowLeft") ? -1 : 0;
            const next = current + step;
            if (step && next >= 0 && next < count) {
              e.preventDefault();
              onChange?.(next);
              (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
            }
          }}
        />
      ))}
    </div>
  );
}
