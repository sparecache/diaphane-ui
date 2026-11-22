// Playground screens: grouped list, swipe actions, pull to refresh,
// tab bar accessory and minimized tab bar.
import { useLayoutEffect, useRef, useState } from "react";
import { List } from "../../src/components/List";
import { ListSection } from "../../src/components/ListSection";
import { ListItem, type ListItemSwipeAction } from "../../src/components/ListItem";
import { Screen } from "../../src/components/Screen";
import { NavigationBar } from "../../src/components/NavigationBar";
import { TabBar } from "../../src/components/TabBar";
import { Icon } from "../../src/components/Icon";
import "./lists-more.css";

const noop = () => {};

/** Playground screen: grouped list. */
export function ListGroupedScreen() {
  return (
    <Screen background="grouped">
      <List variant="grouped">
        <ListSection header="Connectivity" footer="Grouped lists run sections edge to edge with a separator above and below each one.">
          <ListItem title="Airplane Mode" icon="airplane" iconColor="orange" />
          <ListItem title="Wi‑Fi" icon="wifi" iconColor="blue" value="Home" accessory="chevron" />
          <ListItem title="Bluetooth" icon="antenna.radiowaves.left.and.right" iconColor="blue" accessory="toggle" toggled />
        </ListSection>
        <ListSection header="Details">
          <ListItem title="Version" value="27.2" />
          <ListItem title="General" accessory="chevron" />
          <ListItem title="Checked" badge={3} />
          <ListItem title="Sign Out" role="destructive" />
        </ListSection>
        <ListSection>
          <ListItem title="About" accessory="chevron" />
        </ListSection>
      </List>
    </Screen>
  );
}

const messages: [string, string][] = [
  ["Sofia Marin", "Lunch on Friday?"],
  ["Leo Park", "Quarterly report"],
  ["Omar Haddad", "Photos from the trip"],
  ["Noah Fischer", "Re: Invoice 1042"],
  ["Ivy Chen", "Welcome aboard"],
  ["Maya Reed", "Weekend plans"],
];
const trailing: ListItemSwipeAction[] = [
  { label: "Delete", icon: "trash.fill", tone: "destructive", onPress: noop },
  { label: "Flag", icon: "flag.fill", tone: "orange", onPress: noop },
  { label: "More", icon: "ellipsis", tone: "gray", onPress: noop },
];
const leading: ListItemSwipeAction[] = [{ label: "Unread", icon: "envelope.badge.fill", tone: "blue", onPress: noop }];

/** Playground screen: plain list, row 2 swiped open on its trailing actions. */
export function ListSwipeScreen() {
  return (
    <Screen background="plain">
      <List variant="plain">
        <ListSection header="Inbox">
          {messages.map(([from, subject], i) => (
            <ListItem
              key={from}
              title={from}
              subtitle={subject}
              trailingActions={trailing}
              leadingActions={leading}
              swiped={i === 1 ? "trailing" : undefined}
            />
          ))}
        </ListSection>
      </List>
    </Screen>
  );
}

const mailboxes = ["Inbox", "Drafts", "Sent", "Junk", "Trash", "Archive", "Flagged", "Unread"];

/** Playground screen: pull to refresh in its refreshing state. */
export function RefreshScreen() {
  const [refreshing, setRefreshing] = useState(true);
  return (
    <Screen background="plain" refreshing={refreshing} onRefresh={() => setRefreshing(true)} refreshLabel="Refreshing">
      <List variant="plain">
        <ListSection header="Mailboxes">
          {mailboxes.map((m) => <ListItem key={m} title={m} />)}
        </ListSection>
      </List>
    </Screen>
  );
}

/** The mini player used as the tab bar accessory (mini player). */
function MiniPlayer() {
  return (
    <>
      <span className="pg-mini__art" aria-hidden="true"><Icon name="music.note" weight="medium" /></span>
      <span className="pg-mini__title">Morning Light</span>
      <button type="button" className="pg-mini__btn" aria-label="Play"><Icon name="play.fill" /></button>
      <button type="button" className="pg-mini__btn" aria-label="Next"><Icon name="forward.fill" /></button>
    </>
  );
}

const tabs = [
  { icon: "house.fill", label: "Home" },
  { icon: "square.grid.2x2.fill", label: "Library" },
  { icon: "person.fill", label: "Profile" },
];

/** Playground screen: tab bar with a bottom accessory. */
export function TabBarAccessoryScreen() {
  const [sel, setSel] = useState(0);
  const title = ["Home", "Library", "Profile", "Search"][sel] ?? "Home";
  return (
    <Screen
      background="grouped"
      header={<NavigationBar title={title} />}
      bottomBar={<TabBar label="Tabs" items={tabs} searchLabel="Search" selected={sel} onChange={setSel} accessory={<MiniPlayer />} accessoryLabel="Now Playing" />}
    >
      <List>
        <ListSection>
          {[1, 2, 3, 4].map((i) => <ListItem key={i} title={`${title} item ${i}`} />)}
        </ListSection>
      </List>
    </Screen>
  );
}

/** Playground screen: scrolled to the end, tab bar minimized with the accessory inline. */
export function TabBarMinimizedScreen() {
  const [sel, setSel] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  // Playground only: the screen is shown at the maximum scroll offset with the bar minimized.
  // Add `&live` to the URL to start at the top and let the bar follow the scroll instead.
  const live = new URLSearchParams(location.search).has("live");
  useLayoutEffect(() => {
    const scroller = ref.current?.closest(".dph-screen__scroll");
    if (scroller && !live) scroller.scrollTop = scroller.scrollHeight;
  }, [live]);
  return (
    <Screen
      background="grouped"
      topEdgeEffect="hard"
      header={<NavigationBar title="Home" displayMode="inline" />}
      bottomBar={<TabBar label="Tabs" items={tabs} searchLabel="Search" selected={sel} onChange={setSel} accessory={<MiniPlayer />} accessoryLabel="Now Playing" minimizeBehavior="onScrollDown" minimized={live ? undefined : true} />}
    >
      <div ref={ref} className="pg-mini__anchor" />
      <List>
        <ListSection>
          {Array.from({ length: 30 }, (_, i) => <ListItem key={i} title={`Home item ${i + 1}`} />)}
        </ListSection>
      </List>
    </Screen>
  );
}
