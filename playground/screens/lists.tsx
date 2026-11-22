import { List } from "../../src/components/List";
import { ListSection } from "../../src/components/ListSection";
import { ListItem } from "../../src/components/ListItem";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Avatar } from "../../src/components/Avatar";
import { Icon } from "../../src/components/Icon";
import { Text } from "../../src/components/Text";
import "./lists.css";

/** Playground screen. */
export function ListInsetGroupedScreen() {
  return (
    <div className="pg-ref grouped">
      <List>
        <ListSection header="Connectivity" footer="Footers explain the section in a sentence or two and wrap onto more lines when needed.">
          <ListItem title="Airplane Mode" icon="airplane" iconColor="orange" />
          <ListItem title="Wi‑Fi" icon="wifi" iconColor="blue" badge="Home" />
          <ListItem title="Bluetooth" icon="antenna.radiowaves.left.and.right" iconColor="blue" accessory="chevron" />
          <ListItem title="Notifications" icon="bell.fill" iconColor="red" accessory="toggle" toggled />
        </ListSection>
        <ListSection header="Details">
          <ListItem title="Version" value="27.2" />
          <ListItem title="General" accessory="chevron" />
          <ListItem title="Language" value="English" accessory="chevron" />
          <ListItem title="Title" subtitle="Subtitle text" />
          <ListItem title="Checked" badge={3} />
          <ListItem title="Sign Out" role="destructive" />
          <ListItem title="Accent Action" role="action" />
        </ListSection>
      </List>
    </div>
  );
}

const people = ["Sofia Marin", "Leo Park", "Omar Haddad", "Noah Fischer", "Ivy Chen", "Maya Reed"];

/**
 * Playground screen.
 */
export function ListPlainScreen() {
  return (
    <Screen background="plain">
      <List variant="plain">
        <ListSection header="Contacts">
          {people.map((p) => <ListItem key={p} title={p} />)}
        </ListSection>
        <ListSection header="Recent">
          <ListItem prominent leading={<Avatar initials="SM" />} title="Sofia Marin" subtitle="See you tomorrow at 9" value="9:41" />
        </ListSection>
      </List>
    </Screen>
  );
}

/** Playground screen: edit-mode multi-selection + checkmark rows. */
export function ListSelectionScreen() {
  const selected = new Set(["Groceries", "Reading"]);
  return (
    <Screen background="grouped">
      <List>
        <ListSection header="Lists">
          {["Groceries", "Errands", "Reading", "Workouts"].map((t) => (
            <ListItem key={t} title={t} selectable selected={selected.has(t)} />
          ))}
        </ListSection>
        <ListSection header="Checkmark rows">
          <ListItem title="Light" accessory="checkmark" selected />
          <ListItem title="Dark" />
          <ListItem title="Automatic" />
        </ListSection>
      </List>
    </Screen>
  );
}

/** Playground screen: GroupBox ×2, glass card, badges. */
export function CardScreen() {
  return (
    <Screen background="grouped">
      <div className="pg-lists-stack">
        <Card title="Activity">You've closed all three rings five days in a row.</Card>
        <Card>
          <span className="pg-lists-label"><Icon name="gearshape" />Software Update</span>
        </Card>
        <Card variant="glass">
          <span className="pg-lists-center">Glass card</span>
        </Card>
        <Text variant="headline">Badges</Text>
        <div className="pg-lists-row">
          <Badge value={3} />
          <Badge value="New" tone="accent" />
        </div>
      </div>
    </Screen>
  );
}

/** 40-row plain list; drag and hold to show the scroll indicator. */
export function ScrollIndicatorScreen() {
  return (
    <Screen background="plain">
      <List variant="plain">
        <ListSection>
          {Array.from({ length: 40 }, (_, i) => <ListItem key={i} title={`Row ${i + 1}`} />)}
        </ListSection>
      </List>
    </Screen>
  );
}
