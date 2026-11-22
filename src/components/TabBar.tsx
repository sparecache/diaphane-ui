import { useContext, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { ScreenScrollContext } from "./Screen";
import "./BarActions.css";
import "./TabBar.css";

export interface TabBarItem {
  /** Icon name. Tab bars show the .fill variant (e.g. "house.fill"). */
  icon: IconName;
  label: string;
  /** .badge(): count or short text in a red capsule on the icon. */
  badge?: string | number;
  testId?: string;
}

export type TabBarSearchPlacement = "inline" | "separate";
export type TabBarMinimizeBehavior = "never" | "onScrollDown";

export interface TabBarProps {
  /** 2–5 tabs. */
  items: TabBarItem[];
  /** Index of the selected tab; the search tab (when present) is index `items.length`. */
  selected: number;
  onChange?: (index: number) => void;
  /** Adds the search tab (Tab(role: .search)) with this title. */
  searchLabel?: string;
  /** Search tab symbol; defaults to "magnifyingglass". */
  searchIcon?: IconName;
  /** inline: last item of the glass pill (with ≤ 4 tabs). separate: its own glass circle beside the pill. */
  searchPlacement?: TabBarSearchPlacement;
  /** Accessible name of the tab list. */
  label?: string;
  /**
   * Bottom accessory, e.g. a mini player: a 48pt glass capsule above the bar, or inline
   * between the selected tab and search when the bar is minimized. Content is laid out in a row with 16pt padding.
   */
  accessory?: ReactNode;
  /** Accessible name of the accessory region, e.g. "Now Playing". */
  accessoryLabel?: string;
  /** onScrollDown: collapses to the selected tab (leading) and search (trailing) while the Screen content scrolls down. */
  minimizeBehavior?: TabBarMinimizeBehavior;
  /** Forces the minimized (true) or expanded (false) state, e.g. to render it statically. */
  minimized?: boolean;
  testId?: string;
}

interface Entry { key: number; icon: IconName; label: string; badge?: string | number; testId?: string }

function TabButton({ entry, selected, onChange, labelled }: { entry: Entry; selected: boolean; onChange?: (index: number) => void; labelled?: boolean }) {
  return (
    <button
      type="button"
      role="tab"
      className="dph-tabbar__item"
      aria-selected={selected}
      aria-label={labelled ? entry.label : undefined}
      data-testid={entry.testId}
      onClick={() => onChange?.(entry.key)}
    >
      <span className="dph-tabbar__icon" aria-hidden="true"><Icon name={entry.icon} weight="medium" /></span>
      <span className="dph-tabbar__label">{entry.label}</span>
      {entry.badge !== undefined && entry.badge !== "" && <span className="dph-tabbar__badge">{entry.badge}</span>}
    </button>
  );
}

/** Floating glass tab bar (TabView). Put it in Screen's `bottomBar` slot. */
export function TabBar({
  items, selected, onChange, searchLabel, searchIcon = "magnifyingglass", searchPlacement = "inline", label,
  accessory, accessoryLabel, minimizeBehavior = "never", minimized, testId,
}: TabBarProps) {
  const scroll = useContext(ScreenScrollContext);
  const isMin = minimized ?? (minimizeBehavior === "onScrollDown" && !!scroll?.scrolledDown);
  const entries: Entry[] = items.map((it, i) => ({ key: i, ...it }));
  const searchEntry: Entry | undefined = searchLabel !== undefined ? { key: items.length, icon: searchIcon, label: searchLabel } : undefined;
  const inline = searchEntry && searchPlacement === "inline" && !isMin ? [...entries, searchEntry] : entries;
  const separate = searchEntry && (searchPlacement === "separate" || isMin) ? searchEntry : undefined;
  // Minimized: only the selected tab stays (the search tab keeps its own circle).
  const shown = isMin ? inline.filter((e) => e.key === selected).slice(0, 1) : inline;
  const first = shown.length ? shown : entries.slice(0, 1);
  return (
    <nav className="dph-tabbar" aria-label={label} data-minimized={isMin || undefined} data-has-accessory={accessory ? "" : undefined} data-testid={testId}>
      {accessory && (
        <div className="dph-bar-glass dph-tabbar__accessory" role="region" aria-label={accessoryLabel}>{accessory}</div>
      )}
      <div className="dph-bar-glass dph-tabbar__platter" role="tablist" style={{ ["--_n" as string]: first.length }}>
        {first.map((e) => <TabButton key={e.key} entry={e} selected={selected === e.key} onChange={onChange} labelled={isMin} />)}
      </div>
      {separate && (
        <div className="dph-bar-glass dph-tabbar__search" role="tablist">
          <TabButton entry={separate} selected={selected === separate.key} onChange={onChange} labelled />
        </div>
      )}
    </nav>
  );
}
