// Navigation screens (ids registered in screens/index.tsx).
import { useState } from "react";
import { Screen } from "../../src/components/Screen";
import { List } from "../../src/components/List";
import { ListSection } from "../../src/components/ListSection";
import { ListItem } from "../../src/components/ListItem";
import { NavigationBar } from "../../src/components/NavigationBar";
import { TabBar } from "../../src/components/TabBar";
import { Toolbar } from "../../src/components/Toolbar";
import { SearchField } from "../../src/components/SearchField";
import { SegmentedControl } from "../../src/components/SegmentedControl";
import { PageControl } from "../../src/components/PageControl";

const mailboxes = ["Inbox", "Drafts", "Sent", "Junk", "Trash", "Archive"];
const noop = () => {};

/** Playground screen. */
export function NavLargeScreen() {
  return (
    <Screen
      background="grouped"
      header={
        <NavigationBar
          title="Mailboxes"
          leading={[{ icon: "gearshape", label: "Settings", onPress: noop }]}
          trailing={[{ label: "Edit", onPress: noop }]}
        />
      }
    >
      <List>
        <ListSection>
          {mailboxes.map((m) => <ListItem key={m} title={m} accessory="chevron" onPress={noop} />)}
        </ListSection>
      </List>
    </Screen>
  );
}

/** Playground screen: pushed "Inbox" with subtitle, back button and a merged trailing glass group. */
export function NavInlineScreen() {
  return (
    <Screen
      background="grouped"
      header={
        <NavigationBar
          title="Inbox"
          subtitle="12 unread"
          displayMode="inline"
          backLabel="Mailboxes"
          onBack={noop}
          trailing={[{ icon: "magnifyingglass", label: "Search", onPress: noop }, { icon: "ellipsis", label: "More", onPress: noop }]}
        />
      }
    >
      <List>
        <ListSection>
          {[1, 2, 3, 4, 5, 6].map((i) => <ListItem key={i} title={`Message ${i}`} />)}
        </ListSection>
      </List>
    </Screen>
  );
}

/** Playground screen: Home tab selected, Library badged, search tab inside the pill. */
export function TabBarScreen() {
  const [sel, setSel] = useState(0);
  const title = ["Home", "Library", "Profile", "Search"][sel] ?? "Home";
  return (
    <Screen
      background="grouped"
      header={<NavigationBar title={title} />}
      bottomBar={
        <TabBar
          label="Tabs"
          items={[
            { icon: "house.fill", label: "Home" },
            { icon: "square.grid.2x2.fill", label: "Library", badge: 3 },
            { icon: "person.fill", label: "Profile" },
          ]}
          searchLabel="Search"
          selected={sel}
          onChange={setSel}
        />
      }
    >
      <List>
        <ListSection>
          {[1, 2, 3, 4].map((i) => <ListItem key={i} title={`${title} item ${i}`} />)}
        </ListSection>
      </List>
    </Screen>
  );
}

/** Search field: sits at the bottom on phones. */
export function NavSearchScreen() {
  const [query, setQuery] = useState("");
  const shown = mailboxes.filter((m) => m.toLowerCase().includes(query.toLowerCase()));
  return (
    <Screen
      background="grouped"
      header={<NavigationBar title="Search" />}
      bottomBar={
        <SearchField
          value={query}
          placeholder="Search"
          onChange={setQuery}
          onCancel={() => setQuery("")}
          clearLabel="Clear text"
          cancelLabel="Close search"
        />
      }
    >
      <List>
        <ListSection>
          {shown.map((m) => <ListItem key={m} title={m} />)}
        </ListSection>
      </List>
    </Screen>
  );
}

/** Playground screen: folder · "6 Notes" status · compose. */
export function ToolbarBottomScreen() {
  return (
    <Screen
      background="grouped"
      header={<NavigationBar title="Notes" />}
      bottomBar={
        <Toolbar
          label="Notes actions"
          leading={[{ icon: "folder", label: "Folders", onPress: noop }]}
          status="6 Notes"
          trailing={[{ icon: "square.and.pencil", label: "New Note", onPress: noop }]}
        />
      }
    >
      <List>
        <ListSection>
          {mailboxes.map((m) => <ListItem key={m} title={m} />)}
        </ListSection>
      </List>
    </Screen>
  );
}

/** Playground screen: pickers stacked with 20pt spacing, 16pt side padding. Each picker lays out at 31pt and draws 32pt. */
export function SegmentedScreen() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const [c, setC] = useState(2);
  const slot = { height: 31, flex: "none" } as const;
  return (
    <Screen>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 16px" }}>
        <div style={slot}>
          <SegmentedControl label="First or second" segments={[{ label: "First" }, { label: "Second" }]} selected={a} onChange={setA} />
        </div>
        <div style={slot}>
          <SegmentedControl label="Range" segments={[{ label: "Day" }, { label: "Week" }, { label: "Month" }]} selected={b} onChange={setB} />
        </div>
        <div style={slot}>
          <SegmentedControl label="Letter" segments={["A", "B", "C", "D", "E"].map((l) => ({ label: l }))} selected={c} onChange={setC} />
        </div>
        <div style={{ ...slot, width: 140 }}>
          <SegmentedControl
            label="Layout"
            segments={[{ label: "List", icon: "list.bullet" }, { label: "Grid", icon: "square.grid.2x2" }]}
            selected={a}
            onChange={setA}
          />
        </div>
        <div style={slot}>
          <SegmentedControl label="Power" segments={[{ label: "Off" }, { label: "On" }]} selected={b} onChange={setB} disabled />
        </div>
      </div>
    </Screen>
  );
}

/** Playground screen: bare dots over a tinted 220pt pager, capsule dots on a clear 120pt pager. */
export function PageControlScreen() {
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const pager = (height: number, tint: string | undefined) => ({
    position: "relative" as const, height, flex: "none", display: "flex", alignItems: "flex-end", justifyContent: "center",
    paddingBottom: 12, background: tint,
  });
  return (
    <Screen>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={pager(220, `color-mix(in srgb, var(--dph-system-blue) ${15 + p1 * 10}%, transparent)`)}>
          <PageControl label="Page" count={5} current={p1} onChange={setP1} />
        </div>
        <div style={pager(120, undefined)}>
          <PageControl label="Page" count={4} current={p2} onChange={setP2} background />
        </div>
      </div>
    </Screen>
  );
}
