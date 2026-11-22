import { useState } from "react";
import {
  NavigationStack, useNavigation, Screen, NavigationBar, SearchField, List, ListSection, ListItem, Avatar, Text, Stack, Card, Glass,
  IconButton, TextField, Sheet, Banner, EmptyState, ContextMenu,
} from "../../src/index";
import { account, ME } from "./account";

import lena from "./art/avatar-lena.svg";
import tobias from "./art/avatar-tobias.svg";
import ines from "./art/avatar-ines.svg";
import kofi from "./art/avatar-kofi.svg";

/** Messaging flow — inbox with people row, pinned and swipeable conversations, search, compose sheet; threads with bubbles and a message input. */
interface Msg { id: number; me: boolean; text: string; time: string }
interface Convo { id: string; name: string; initials: string; when: string; unread: number; pinned: boolean; msgs: Msg[] }
const m = (id: number, me: boolean, text: string, time: string): Msg => ({ id, me, text, time });
const initialsOf = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2);
/** About half the people have a photo-style avatar; the rest get initials in a stable tone. */
const PHOTOS: Record<string, string> = { "Lena Vogt": lena, "Tobias Weir": tobias, "Ines Marlowe": ines, "Kofi Adair": kofi };
const PersonAvatar = ({ name, size }: { name: string; size?: "small" | "medium" | "large" }) => (
  <Avatar src={PHOTOS[name]} initials={initialsOf(name)} name={name} tone="auto" size={size} />
);
const CONTACTS = ["Lena Vogt", "Soraya Imel", "Tobias Weir", "Nadia Brandt", "Kofi Adair", "Ines Marlowe", "Jonas Petrik", "Priya Lindqvist"];
const SEED: Convo[] = [
  { id: "Lena Vogt", name: "Lena Vogt", initials: "LV", when: "10:24 AM", unread: 2, pinned: true, msgs: [
    m(1, false, "Are we still on for dinner tonight?", "10:12 AM"), m(2, true, "Yes, I booked the window table.", "10:15 AM"),
    m(3, false, "Perfect. I will bring the dessert.", "10:22 AM"), m(4, false, "See you at 6!", "10:24 AM") ] },
  { id: "Soraya Imel", name: "Soraya Imel", initials: "SI", when: "9:03 AM", unread: 0, pinned: true, msgs: [m(1, true, "Sent you the draft, no rush.", "8:40 AM"), m(2, false, "Thanks, I will read it on the train.", "9:03 AM")] },
  { id: "Tobias Weir", name: "Tobias Weir", initials: "TW", when: "8:47 AM", unread: 5, pinned: false, msgs: [m(1, false, "The new route is much quieter.", "8:30 AM"), m(2, false, "Want to try it on Saturday?", "8:47 AM")] },
  { id: "Nadia Brandt", name: "Nadia Brandt", initials: "NB", when: "Yesterday", unread: 0, pinned: false, msgs: [m(1, false, "Photos from the market are in the shared album.", "6:15 PM")] },
  { id: "Kofi Adair", name: "Kofi Adair", initials: "KA", when: "Yesterday", unread: 1, pinned: false, msgs: [m(1, false, "Running ten minutes late, sorry!", "4:02 PM")] },
  { id: "Ines Marlowe", name: "Ines Marlowe", initials: "IM", when: "Mon", unread: 0, pinned: false, msgs: [m(1, true, "Happy birthday! Hope it is a good one.", "9:00 AM"), m(2, false, "Thank you so much!", "9:41 AM")] },
];
const now = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function MessagesFlow() {
  return (
    <NavigationStack backLabel="Messages">
      <Inbox />
    </NavigationStack>
  );
}

function Inbox() {
  const nav = useNavigation();
  const [convos, setConvos] = useState(SEED);
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const shown = convos.filter((c) => !q || c.name.toLowerCase().includes(q) || c.msgs.some((x) => x.text.toLowerCase().includes(q)));
  const unread = convos.reduce((a, c) => a + c.unread, 0);
  const patch = (id: string, f: Partial<Convo>) => setConvos((cs) => cs.map((c) => (c.id === id ? { ...c, ...f } : c)));
  const open = (name: string) => {
    let c = convos.find((x) => x.id === name);
    if (!c) { c = { id: name, name, initials: initialsOf(name), when: "", unread: 0, pinned: false, msgs: [] }; setConvos((cs) => [c!, ...cs]); }
    else patch(name, { unread: 0 });
    nav?.push(<Thread convo={c} onSend={(msgs) => patch(name, { msgs, when: "Now" })} />);
  };
  const remove = (c: Convo, verb: string) => { setConvos((cs) => cs.filter((x) => x.id !== c.id)); setToast(`${verb} ${c.name}`); };
  const row = (c: Convo) => {
    const last = c.msgs[c.msgs.length - 1];
    return (
      <ListItem
        key={c.id}
        prominent
        leading={<PersonAvatar name={c.name} size="large" />}
        title={c.name}
        subtitle={last ? `${last.me ? "You: " : ""}${last.text}` : "No messages yet"}
        value={c.when}
        valueAlignment="top"
        badge={c.unread}
        onPress={() => open(c.id)}
        leadingActions={[{ label: c.pinned ? "Unpin" : "Pin", icon: "pin", tone: "orange", onPress: () => patch(c.id, { pinned: !c.pinned }) }]}
        trailingActions={[
          { label: "Delete", icon: "trash.fill", tone: "destructive", onPress: () => remove(c, "Deleted") },
          { label: "Archive", icon: "tray", tone: "blue", onPress: () => remove(c, "Archived") },
          { label: "Mute", icon: "bell.slash", tone: "gray", onPress: () => setToast(`Muted ${c.name}`) },
        ]}
      />
    );
  };
  const pinned = shown.filter((c) => c.pinned);
  const others = shown.filter((c) => !c.pinned);
  return (
    <Screen
      header={<NavigationBar title="Messages" subtitle={unread ? `${unread} unread` : "All caught up"} trailing={[{ icon: "square.and.pencil", label: "New message", onPress: () => setComposing(true) }]} account={account()} />}
      bottomBar={<SearchField value={query} onChange={setQuery} onCancel={() => setQuery("")} placeholder="Search" label="Search messages" clearLabel="Clear" cancelLabel="Cancel" />}
    >
      {!q && (
        <Stack direction="horizontal" scroll itemWidth={76} gap="1" padding="inline">
          {CONTACTS.map((n) => (
            <ContextMenu key={n} open={menu === n} onOpenChange={(o) => setMenu(o ? n : null)} label={n} onPress={() => open(n)} items={[{ label: "Message", icon: "message", onPress: () => { setMenu(null); open(n); } }, { label: "Mute", icon: "bell.slash", onPress: () => { setMenu(null); setToast(`Muted ${n}`); } }]}>
              <Stack align="center" gap="1">
                <PersonAvatar name={n} size="large" />
                <Text variant="caption1" color="secondary" lines={1}>{n.split(" ")[0]}</Text>
              </Stack>
            </ContextMenu>
          ))}
        </Stack>
      )}
      {shown.length === 0 ? (
        <EmptyState variant="search" query={query} title="No Results" description="Try a different name or word." />
      ) : (
        <List variant="plain" label="Conversations">
          {pinned.length > 0 && <ListSection header="Pinned">{pinned.map(row)}</ListSection>}
          {others.length > 0 && <ListSection header={pinned.length ? "Recent" : undefined}>{others.map(row)}</ListSection>}
        </List>
      )}
      <Sheet open={composing} onClose={() => setComposing(false)} title="New Message" cancelLabel="Cancel" onCancel={() => setComposing(false)} detent="medium" showGrabber>
        <List label="Contacts">
          <ListSection header="Suggested">
            {CONTACTS.slice(0, 5).map((n) => (
              <ListItem key={n} leading={<PersonAvatar name={n} />} title={n} onPress={() => { setComposing(false); open(n); }} />
            ))}
          </ListSection>
        </List>
      </Sheet>
      <Banner open={!!toast} icon="checkmark.circle.fill" title={toast ?? ""} onDismiss={() => setToast(null)} dismissLabel="Dismiss" />
    </Screen>
  );
}

function Thread({ convo, onSend }: { convo: Convo; onSend: (msgs: Msg[]) => void }) {
  const [msgs, setMsgs] = useState(convo.msgs);
  const [draft, setDraft] = useState("");
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const next = [...msgs, m(msgs.length + 1, true, text, now())];
    setMsgs(next); setDraft(""); onSend(next);
  };
  return (
    <Screen
      background="grouped"
      header={<NavigationBar title={convo.name} subtitle="Active now" displayMode="inline" trailing={[{ icon: "phone", label: "Call", onPress: () => {} }, { icon: "video", label: "Video call", onPress: () => {} }]} />}
      bottomBar={
        <Stack direction="horizontal" gap="2" align="center" padding="inline">
          <Stack grow><TextField variant="roundedBorder" label="Message" labelHidden placeholder="Message" value={draft} onChange={setDraft} onSubmit={send} /></Stack>
          <IconButton variant="glassProminent" icon="arrow.up" label="Send message" disabled={!draft.trim()} onPress={send} />
        </Stack>
      }
    >
      <Stack padding="margin" gap="3">
        <Text variant="caption1" weight="semibold" color="secondary" align="center">Today</Text>
        {msgs.length === 0 && <EmptyState icon="message" title="Say Hello" description={`Start the conversation with ${convo.name}.`} />}
        {msgs.map((x) => (
          <Stack key={x.id} align={x.me ? "end" : "start"} gap="1">
            <Stack>
              {x.me ? (
                <Glass tint="accent" shape="rect" cornerRadius={20}><Stack padding="3"><Text color="onAccent">{x.text}</Text></Stack></Glass>
              ) : (
                <Card variant="grouped"><Text>{x.text}</Text></Card>
              )}
            </Stack>
            <Text variant="caption2" color="tertiary">{x.time}</Text>
          </Stack>
        ))}
      </Stack>
    </Screen>
  );
}
