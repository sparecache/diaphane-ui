import { useState } from "react";
import {
  NavigationStack, useNavigation, Screen, NavigationBar, List, ListSection, ListItem, Avatar, Text, Stack, Button, SegmentedControl,
  Media, Sheet, Form, TextField, Toggle, Alert, Banner, Card, ContextMenu, type MediaTone,
} from "../../src/index";

/** Profile flow — header, stats, posts grid with context menus, edit profile (sheet + validation), account pages, sign out. */
interface Profile { name: string; handle: string; bio: string; email: string; isPrivate: boolean }
const POSTS: { tone: MediaTone; icon: string }[] = [
  { tone: "orange", icon: "sun.max.fill" }, { tone: "blue", icon: "water.waves" }, { tone: "green", icon: "leaf.fill" },
  { tone: "purple", icon: "moon.stars.fill" }, { tone: "pink", icon: "camera.macro" }, { tone: "teal", icon: "mountain.2.fill" },
  { tone: "red", icon: "flame.fill" }, { tone: "indigo", icon: "sparkles" }, { tone: "yellow", icon: "star.fill" },
];

export default function ProfileFlow() {
  return (
    <NavigationStack backLabel="Profile">
      <ProfileHome />
    </NavigationStack>
  );
}

function ProfileHome() {
  const nav = useNavigation();
  const [me, setMe] = useState<Profile>({ name: "Jane Doe", handle: "jane", bio: "Designer. Coffee, film cameras and long walks.", email: "jane@example.com", isPrivate: false });
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState(0);
  const [following, setFollowing] = useState(false);
  const [saved, setSaved] = useState(false);
  const initials = me.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  return (
    <Screen
      header={<NavigationBar title={`@${me.handle}`} displayMode="inline" trailing={[{ icon: "gearshape", label: "Account settings", onPress: () => nav?.push(<AccountSettings me={me} />) }]} />}
    >
      <Stack padding="margin" gap="4">
        <Stack direction="horizontal" gap="4" align="center">
          <Avatar initials={initials} name={me.name} size="large" />
          <Stack direction="horizontal" justify="between" grow>
            {[["128", "Posts"], [following ? "2,419" : "2,418", "Followers"], ["311", "Following"]].map(([n, l]) => (
              <Stack key={l} align="center" gap="none">
                <Text variant="headline">{n}</Text>
                <Text variant="caption1" color="secondary">{l}</Text>
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Stack gap="1">
          <Stack direction="horizontal" gap="2" align="center">
            <Text variant="headline">{me.name}</Text>
            {me.isPrivate && <Text variant="footnote" color="secondary">Private</Text>}
          </Stack>
          <Text variant="subheadline" color="secondary">{me.bio}</Text>
        </Stack>
        <Stack direction="horizontal" gap="2">
          <Stack grow><Button variant="bordered" fullWidth label="Edit Profile" onPress={() => setEditing(true)} /></Stack>
          <Stack grow><Button variant={following ? "bordered" : "borderedProminent"} fullWidth label={following ? "Following" : "Follow Back"} onPress={() => setFollowing((f) => !f)} /></Stack>
        </Stack>
        <SegmentedControl label="Content" segments={[{ label: "Posts", icon: "square.grid.3x3" }, { label: "Saved", icon: "bookmark" }]} selected={tab} onChange={setTab} />
        <PostGrid saved={tab === 1} onOpen={(i) => nav?.push(<PostDetail index={i} />)} />
      </Stack>

      <EditProfile open={editing} me={me} onClose={() => setEditing(false)} onSave={(p) => { setMe(p); setEditing(false); setSaved(true); }} />
      <Banner open={saved} tone="success" icon="checkmark.circle.fill" title="Profile updated" onDismiss={() => setSaved(false)} dismissLabel="Dismiss" />
    </Screen>
  );
}

function PostGrid({ saved, onOpen }: { saved: boolean; onOpen: (i: number) => void }) {
  const [menu, setMenu] = useState<number | null>(null);
  const items = saved ? POSTS.slice(3, 7) : POSTS;
  const rows = [0, 3, 6].map((s) => items.slice(s, s + 3)).filter((r) => r.length);
  return (
    <Stack gap="1">
      {rows.map((row, r) => (
        <Stack key={r} direction="horizontal" gap="1">
          {row.map((p, c) => {
            const i = r * 3 + c;
            return (
              <Stack key={i} grow>
                <ContextMenu
                  open={menu === i}
                  onOpenChange={(o) => setMenu(o ? i : null)}
                  label={`Post ${i + 1}`}
                  onPress={() => onOpen(i)}
                  items={[{ label: "Share", icon: "square.and.arrow.up" }, { label: "Save", icon: "bookmark" }, { divider: true }, { label: "Delete", icon: "trash", role: "destructive" }]}
                >
                  <Media ratio="1:1" radius="small" tone={p.tone} icon={p.icon} alt={`Post ${i + 1}`} />
                </ContextMenu>
              </Stack>
            );
          })}
        </Stack>
      ))}
    </Stack>
  );
}

function PostDetail({ index }: { index: number }) {
  const p = POSTS[index % POSTS.length]!;
  const [liked, setLiked] = useState(false);
  return (
    <Screen header={<NavigationBar title="Post" displayMode="inline" trailing={[{ icon: "ellipsis", label: "More", onPress: () => {} }]} />}>
      <Stack gap="3">
        <Media ratio="1:1" radius="none" tone={p.tone} icon={p.icon} alt={`Post ${index + 1}`} />
        <Stack padding="inline" gap="2">
          <Stack direction="horizontal" gap="4">
            <Button variant="plain" icon={liked ? "heart.fill" : "heart"} label={liked ? "Liked" : "Like"} onPress={() => setLiked((l) => !l)} />
            <Button variant="plain" icon="bubble.right" label="Comment" />
            <Button variant="plain" icon="paperplane" label="Share" />
          </Stack>
          <Text variant="subheadline"><Text variant="subheadline" weight="semibold">jane</Text> Morning light over the river.</Text>
          <Text variant="caption1" color="secondary">2 hours ago</Text>
        </Stack>
      </Stack>
    </Screen>
  );
}

function EditProfile({ open, me, onClose, onSave }: { open: boolean; me: Profile; onClose: () => void; onSave: (p: Profile) => void }) {
  const [d, setD] = useState(me);
  const [was, setWas] = useState(open);
  if (open !== was) { setWas(open); if (open) setD(me); }
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email);
  const handleOk = /^[a-z0-9_.]{3,}$/.test(d.handle);
  return (
    <Sheet open={open} onClose={onClose} title="Edit Profile" cancelLabel="Cancel" onCancel={onClose} confirmLabel="Done" confirmDisabled={!emailOk || !handleOk || !d.name.trim()} onConfirm={() => onSave(d)} showGrabber>
      <Stack padding="margin" align="center" gap="2">
        <Avatar initials={d.name.split(" ").map((p) => p[0]).join("").slice(0, 2)} name={d.name} size="large" />
        <Button variant="borderless" size="small" label="Edit Picture" />
      </Stack>
      <Form label="Profile">
        <ListSection>
          <TextField variant="form" label="Name" value={d.name} onChange={(name) => setD({ ...d, name })} />
          <TextField variant="form" label="Username" value={d.handle} onChange={(handle) => setD({ ...d, handle: handle.toLowerCase() })} invalid={!handleOk} errorText={handleOk ? undefined : "At least 3 letters, numbers, dots or underscores."} />
          <TextField variant="form" label="Bio" value={d.bio} onChange={(bio) => setD({ ...d, bio })} multiline minLines={2} />
        </ListSection>
        <ListSection header="Private Information" footer="Your email is never shown on your profile.">
          <TextField variant="form" type="email" label="Email" value={d.email} onChange={(email) => setD({ ...d, email })} invalid={!emailOk} errorText={emailOk ? undefined : "Enter a valid email address."} />
          <ListItem title="Private Account" icon="lock.fill" iconColor="gray" accessory="toggle" toggled={d.isPrivate} onToggle={(isPrivate) => setD({ ...d, isPrivate })} />
        </ListSection>
      </Form>
    </Sheet>
  );
}

function AccountSettings({ me }: { me: Profile }) {
  const nav = useNavigation();
  const [signOut, setSignOut] = useState(false);
  const [notifs, setNotifs] = useState(true);
  return (
    <Screen background="grouped" header={<NavigationBar title="Account" displayMode="inline" />}>
      <List label="Account">
        <ListSection>
          <ListItem prominent leading={<Avatar initials="JD" name={me.name} />} title={me.name} subtitle={me.email} />
        </ListSection>
        <ListSection>
          <ListItem title="Notifications" icon="bell.fill" iconColor="red" accessory="toggle" toggled={notifs} onToggle={setNotifs} />
          <ListItem title="Privacy" icon="hand.raised.fill" iconColor="blue" accessory="chevron" onPress={() => nav?.push(<Privacy />)} />
          <ListItem title="Subscriptions" icon="creditcard.fill" iconColor="green" value="Pro" accessory="chevron" onPress={() => {}} />
        </ListSection>
        <ListSection>
          <ListItem title="Sign Out" role="destructive" onPress={() => setSignOut(true)} />
        </ListSection>
      </List>
      <Alert
        open={signOut}
        onClose={() => setSignOut(false)}
        title="Sign Out?"
        message="You can sign back in at any time with your account."
        actions={[{ label: "Cancel", role: "cancel" }, { label: "Sign Out", role: "destructive", onPress: () => { setSignOut(false); nav?.popToRoot(); } }]}
      />
    </Screen>
  );
}

function Privacy() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <Screen background="grouped" header={<NavigationBar title="Privacy" displayMode="inline" />}>
      <List label="Privacy">
        <ListSection footer="When off, only people you follow can message you.">
          <ListItem title="Message Requests" accessory="toggle" toggled={a} onToggle={setA} />
          <ListItem title="Show Activity Status" accessory="toggle" toggled={b} onToggle={setB} />
        </ListSection>
        <ListSection>
          <ListItem title="Blocked Accounts" value="3" accessory="chevron" onPress={() => {}} />
        </ListSection>
      </List>
      <Stack padding="margin"><Card variant="grouped" title="Data & Privacy" icon="hand.raised.fill"><Text variant="footnote" color="secondary">See how your data is managed.</Text></Card></Stack>
    </Screen>
  );
}
