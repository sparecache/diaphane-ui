import { useState } from "react";
import { Screen, NavigationBar, List, ListSection, ListItem, Avatar, Toolbar, SegmentedControl, Stack } from "../src/index";

const MAIL = [
  { from: "Sofia Marin", initials: "SM", subject: "Lunch on Thursday?", time: "9:41" },
  { from: "Leo Park", initials: "LP", subject: "Quarterly report — final draft attached", time: "8:12" },
  { from: "Maya Reed", initials: "MR", subject: "Photos from the weekend", time: "Yesterday" },
  { from: "Ivy Chen", initials: "IC", subject: "Re: Design review notes", time: "Yesterday" },
  { from: "Noah Fischer", initials: "NF", subject: "Your order has shipped", time: "Tuesday" },
  { from: "Omar Haddad", initials: "OH", subject: "Team offsite agenda", time: "Monday" },
];

/** Reference screen: Mail-style inbox — plain list of prominent rows, segmented filter, bottom toolbar. */
export default function InboxExample() {
  const [filter, setFilter] = useState(0);
  const rows = filter === 0 ? MAIL : MAIL.slice(0, 2);
  return (
    <Screen
      background="plain"
      header={
        <NavigationBar
          title="Inbox"
          leading={[{ icon: "line.3.horizontal.decrease", label: "Filter", onPress: () => {} }]}
          trailing={[{ label: "Edit", onPress: () => {} }]}
        />
      }
      bottomBar={
        <Toolbar
          label="Mailbox actions"
          leading={[{ icon: "tray.2", label: "Mailboxes", onPress: () => {} }]}
          status="Updated Just Now"
          trailing={[{ icon: "square.and.pencil", label: "Compose", onPress: () => {} }]}
        />
      }
    >
      <Stack padding="inline">
        <SegmentedControl label="Filter" segments={[{ label: "All" }, { label: "Unread" }]} selected={filter} onChange={setFilter} />
      </Stack>
      <List variant="plain" label="Messages">
        <ListSection>
          {rows.map((m) => (
            <ListItem
              key={m.from}
              prominent
              leading={<Avatar initials={m.initials} name={m.from} />}
              title={m.from}
              subtitle={m.subject}
              value={m.time}
              onPress={() => {}}
            />
          ))}
        </ListSection>
      </List>
    </Screen>
  );
}
