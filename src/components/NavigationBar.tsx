import { useId } from "react";
import { Icon } from "./Icon";
import { Avatar } from "./Avatar";
import { BarActions, type BarAction } from "./BarActions";
import { useCanGoBack, useNavigation } from "./NavigationStack";
import "./BarActions.css";
import "./NavigationBar.css";

export type { BarAction } from "./BarActions";
export type NavigationBarDisplayMode = "large" | "inline";

/** The signed-in person, shown as the last trailing item (an avatar in a glass circle, the usual way to reach the account). */
export interface NavigationBarAccount {
  /** Full name: the button's accessible name ("Account, Maya Okafor"). */
  name: string;
  /** Photo URL; falls back to the initials. */
  src?: string;
  initials?: string;
  onPress?: () => void;
  testId?: string;
}

export interface NavigationBarProps {
  /** navigationTitle. */
  title: string;
  /** navigationSubtitle: secondary line under the title (e.g. "12 unread"). */
  subtitle?: string;
  /** large: 34pt bold title under the bar (root screens). inline: centered title in the bar (pushed screens). */
  displayMode?: NavigationBarDisplayMode;
  /** Accessible name of the back button (shown as only a glass circle with a back chevron). */
  backLabel?: string;
  /** Shows the back button. */
  onBack?: () => void;
  /** topBarLeading items (after the back button). Adjacent icon actions merge into one glass capsule. */
  leading?: BarAction[];
  /** topBarTrailing items. Adjacent icon actions merge into one glass capsule. */
  trailing?: BarAction[];
  /** The signed-in person: an avatar button placed after the trailing actions. */
  account?: NavigationBarAccount;
  testId?: string;
}

/**
 * Stack header (NavigationStack toolbar): glass bar items, inline or large title, no background or hairline.
 * Put it in Screen's `header` slot, which adds the status-bar safe area and floats it over the content.
 */
export function NavigationBar({
  title, subtitle, displayMode = "large", backLabel, onBack, leading = [], trailing = [], account, testId,
}: NavigationBarProps) {
  const titleId = useId();
  const large = displayMode === "large";
  // Inside a NavigationStack, pushed pages get the back button without wiring onBack.
  const nav = useNavigation();
  const canGoBack = useCanGoBack();
  if (!onBack && canGoBack && nav) { onBack = nav.pop; backLabel = backLabel ?? nav.backLabel; }
  return (
    <header className="dph-navbar" data-display={displayMode} data-testid={testId} aria-labelledby={titleId}>
      <div className="dph-navbar__bar">
        <div className="dph-navbar__leading">
          {onBack && (
            <button type="button" className="dph-bar-glass dph-navbar__back" aria-label={backLabel} onClick={onBack}>
              {/* chevron.left == chevron.backward (flips in RTL); the exported symbol set has no alias names. */}
              <Icon name="chevron.left" scale="large" />
            </button>
          )}
          {leading.length > 0 && <BarActions actions={leading} size="navigation" />}
        </div>
        <div className="dph-navbar__principal" aria-hidden={large || undefined}>
          {/* In large mode this is the collapsed title that fades in on scroll. */}
          <h1 id={large ? undefined : titleId} className="dph-navbar__title" data-has-subtitle={!large && subtitle ? "" : undefined}>{title}</h1>
          {!large && subtitle && <p className="dph-navbar__subtitle">{subtitle}</p>}
        </div>
        <div className="dph-navbar__trailing">
          {trailing.length > 0 && <BarActions actions={trailing} size="navigation" />}
          {account && (
            <button type="button" className="dph-bar-glass dph-navbar__account" aria-label={`Account, ${account.name}`} data-testid={account.testId} onClick={account.onPress}>
              <Avatar src={account.src} initials={account.initials} tone="auto" name={undefined} size="small" />
            </button>
          )}
        </div>
      </div>
      {large && (
        <div className="dph-navbar__large">
          <h1 id={titleId} className="dph-navbar__large-title">{title}</h1>
          {subtitle && <p className="dph-navbar__large-subtitle">{subtitle}</p>}
        </div>
      )}
    </header>
  );
}
