import { BarActions, type BarAction } from "./BarActions";
import "./BarActions.css";
import "./Toolbar.css";

export interface ToolbarProps {
  /** Leading .bottomBar items. Adjacent icon actions merge into one glass capsule. */
  leading?: BarAction[];
  /** Trailing .bottomBar items. */
  trailing?: BarAction[];
  /** ToolbarItem(placement: .status): short centred text in its own glass capsule (e.g. "6 Notes"). */
  status?: string;
  /** Accessible name of the toolbar. */
  label?: string;
  testId?: string;
}

/** Bottom glass toolbar (.toolbar { ToolbarItem(placement: .bottomBar) }). Put it in Screen's `bottomBar` slot. */
export function Toolbar({ leading = [], trailing = [], status, label, testId }: ToolbarProps) {
  return (
    <div className="dph-toolbar" role="toolbar" aria-label={label} data-testid={testId}>
      <div className="dph-toolbar__leading">{leading.length > 0 && <BarActions actions={leading} size="toolbar" />}</div>
      <div className="dph-toolbar__status">
        {status && <span className="dph-bar-glass dph-toolbar__status-text" role="status">{status}</span>}
      </div>
      <div className="dph-toolbar__trailing">{trailing.length > 0 && <BarActions actions={trailing} size="toolbar" />}</div>
    </div>
  );
}
