import { useState } from "react";
import { Icon, type IconName } from "./Icon";
import { Menu, type MenuItem } from "./Menu";
import "./BarActions.css";

/** One bar button (ToolbarItem). Icon actions render as glass circles; text actions as glass capsules. */
export interface BarAction {
  /** Icon name. When set the action is icon-only and `label` becomes its accessible name. */
  icon?: IconName;
  /** Visible title for text actions ("Edit", "Done"); accessible name for icon actions. */
  label: string;
  onPress?: () => void;
  /** glass (default) or glassProminent (accent-filled, e.g. a confirming "Done"). */
  variant?: "glass" | "glassProminent";
  disabled?: boolean;
  /** Pull-down menu instead of a single action: e.g. a "+" that offers what to add, or a Sort button. */
  menu?: MenuItem[];
  testId?: string;
}

/** A bar button that opens a pull-down menu. */
function MenuBarItem({ action }: { action: BarAction }) {
  const [open, setOpen] = useState(false);
  return (
    <Menu
      open={open}
      onOpenChange={setOpen}
      label={action.label}
      items={action.menu!}
      trigger={
        <button type="button" className="dph-bar-item" data-testid={action.testId} aria-label={action.icon ? action.label : undefined} disabled={action.disabled} onClick={() => setOpen(true)}>
          {action.icon ? <Icon name={action.icon} scale="large" /> : <span className="dph-bar-item__label">{action.label}</span>}
        </button>
      }
    />
  );
}

export type BarActionsSize = "navigation" | "toolbar";

interface Group { prominent: boolean; icons: boolean; items: BarAction[] }

/** Adjacent icon-only glass actions share one glass capsule (ToolbarItemGroup); text and prominent actions stand alone. */
function groupActions(actions: BarAction[]): Group[] {
  const groups: Group[] = [];
  for (const a of actions) {
    const prominent = a.variant === "glassProminent";
    const icons = !!a.icon;
    const last = groups[groups.length - 1];
    if (last && icons && last.icons && !prominent && !last.prominent) last.items.push(a);
    else groups.push({ prominent, icons, items: [a] });
  }
  return groups;
}

/**
 * Internal building block shared by NavigationBar and Toolbar (not a catalog component):
 * renders bar actions as glass circles / capsules and merges adjacent icon actions.
 */
export function BarActions({ actions, size }: { actions: BarAction[]; size: BarActionsSize }) {
  return (
    <div className="dph-bar-actions" data-size={size}>
      {groupActions(actions).map((g, gi) => (
        <div
          key={gi}
          className="dph-bar-glass dph-bar-group"
          data-prominent={g.prominent || undefined}
          data-kind={g.icons ? "icon" : "text"}
          data-count={g.items.length}
        >
          {g.items.map((a, i) => a.menu ? <MenuBarItem key={i} action={a} /> : (
            <button
              key={i}
              type="button"
              className="dph-bar-item"
              data-testid={a.testId}
              aria-label={a.icon ? a.label : undefined}
              disabled={a.disabled}
              aria-disabled={a.disabled || undefined}
              onClick={a.disabled ? undefined : a.onPress}
            >
              {a.icon ? <Icon name={a.icon} scale="large" /> : <span className="dph-bar-item__label">{a.label}</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
