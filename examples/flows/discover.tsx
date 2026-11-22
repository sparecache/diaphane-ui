import { useState } from "react";
import {
  NavigationStack, useNavigation, Screen, NavigationBar, TabBar, List, ListSection, ListItem, Card, Media, Glass, Text, Stack, Button,
  IconButton, ProgressView, Badge, Gauge, ContextMenu, Banner, type MediaTone,
} from "../../src/index";

/** Cards & lists flow — Discover: one feed, many card purposes (hero, carousel, stats, events, articles, promo, saved list). */
const ARTICLES: { id: number; title: string; summary: string; source: string; time: string; tone: MediaTone; icon: string }[] = [
  { id: 1, title: "The quiet return of film cameras", summary: "Why a new generation is choosing 36 exposures over infinite ones.", source: "Field Notes", time: "2h", tone: "orange", icon: "camera.fill" },
  { id: 2, title: "A weekend in the Alps", summary: "Lake swims, mountain huts and the best cheese of your life.", source: "Travel Journal", time: "5h", tone: "teal", icon: "mountain.2.fill" },
  { id: 3, title: "How cities are cooling streets", summary: "Shade, water and white roofs: what works when summers hit 45°.", source: "Metro Weekly", time: "1d", tone: "green", icon: "tree.fill" },
];
const SHOWS: { title: string; meta: string; progress: number; tone: MediaTone; icon: string }[] = [
  { title: "Deep Ocean", meta: "S1 · E4 · 22 min left", progress: 0.62, tone: "blue", icon: "water.waves" },
  { title: "Night Kitchen", meta: "S2 · E1 · 41 min left", progress: 0.18, tone: "purple", icon: "fork.knife" },
  { title: "Summit", meta: "Film · 1 h 05 min left", progress: 0.4, tone: "teal", icon: "mountain.2.fill" },
];
const EVENTS = [
  { month: "NOV", day: "22", title: "Design Systems Meetup", place: "LX Factory · 18:30" },
  { month: "NOV", day: "28", title: "Jazz in the Garden", place: "Gulbenkian · 21:00" },
  { month: "DEC", day: "03", title: "Running Club 10K", place: "Belém · 08:00" },
];

export default function DiscoverFlow() {
  const [tab, setTab] = useState(0);
  return (
    <NavigationStack backLabel="Discover">
      <Discover tab={tab} onTab={setTab} />
    </NavigationStack>
  );
}

function Discover({ tab, onTab }: { tab: number; onTab: (i: number) => void }) {
  const nav = useNavigation();
  const [saved, setSaved] = useState<number[]>([2]);
  const [menu, setMenu] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<string[]>([]);
  const toggleSave = (id: number) => { setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])); setToast(saved.includes(id) ? "Removed from Saved" : "Saved for later"); };
  const open = (id: number) => nav?.push(<Article id={id} saved={saved.includes(id)} onSave={() => toggleSave(id)} />);
  return (
    <Screen
      background="grouped"
      header={<NavigationBar title="Discover" trailing={[{ icon: "bell", label: "Notifications", onPress: () => {} }]} />}
      bottomBar={<TabBar label="Sections" items={[{ icon: "sparkles", label: "Discover" }, { icon: "bookmark.fill", label: "Saved", badge: saved.length || undefined }, { icon: "person.crop.circle", label: "You" }]} selected={tab} onChange={onTab} searchLabel="Search" />}
    >
      <Stack gap="6">
        {/* 1 · Hero: media with a glass caption */}
        <Stack padding="inline">
          <Media ratio="4:3" radius="large" tone="teal" icon="mountain.2.fill" alt="A weekend in the Alps" onPress={() => open(2)}>
              <Glass variant="regular" shape="rect" cornerRadius={18}>
                <Stack padding="3" gap="1">
                  <Text variant="caption1" weight="semibold" color="secondary">FEATURED · TRAVEL</Text>
                  <Text variant="title3" weight="bold">A weekend in the Alps</Text>
                </Stack>
              </Glass>
          </Media>
        </Stack>

        {/* 2 · Carousel: continue watching, with progress */}
        <Stack gap="2">
          <Stack padding="inline" direction="horizontal" justify="between" align="baseline">
            <Text variant="title3" weight="bold">Continue Watching</Text>
            <Button variant="borderless" size="small" label="See All" />
          </Stack>
          <Stack direction="horizontal" scroll itemWidth={250} gap="3" padding="inline">
            {SHOWS.map((s) => (
              <Stack key={s.title} gap="2">
                <Media ratio="16:9" radius="medium" tone={s.tone} icon={s.icon} alt={s.title}>
                  <ProgressView variant="linear" value={s.progress} label={`${s.title} progress`} tint="gray" />
                </Media>
                <Stack gap="none">
                  <Text variant="subheadline" weight="semibold">{s.title}</Text>
                  <Text variant="caption1" color="secondary">{s.meta}</Text>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>

        {/* 3 · Stat cards: glanceable numbers */}
        <Stack padding="inline" direction="horizontal" gap="3">
          <Stack grow>
            <Card variant="grouped" title="Reading" icon="book.fill">
              <Stack direction="horizontal" align="center" gap="3">
                <Gauge variant="capacity" value={0.75} label="Goal" currentValueLabel="75%" tint="accent" />
                <Stack gap="none"><Text variant="title3" weight="bold" design="rounded">15 min</Text><Text variant="caption1" color="secondary">of 20 today</Text></Stack>
              </Stack>
            </Card>
          </Stack>
          <Stack grow>
            <Card variant="grouped" title="Streak" icon="flame.fill">
              <Stack gap="none"><Text variant="title1" weight="bold" design="rounded">12</Text><Text variant="caption1" color="secondary">days in a row</Text></Stack>
            </Card>
          </Stack>
        </Stack>

        {/* 4 · Event rows: date badge, RSVP action */}
        <List label="Events">
          <ListSection header="Upcoming Events">
            {EVENTS.map((e) => (
              <ListItem
                key={e.title}
                prominent
                leading={<Stack align="center" gap="none"><Text variant="caption2" weight="semibold" color="danger">{e.month}</Text><Text variant="title2" weight="bold" design="rounded">{e.day}</Text></Stack>}
                title={e.title}
                subtitle={e.place}
                value={rsvp.includes(e.title) ? "Going" : undefined}
                accessory={rsvp.includes(e.title) ? "checkmark" : "none"}
                onPress={() => setRsvp((r) => (r.includes(e.title) ? r.filter((x) => x !== e.title) : [...r, e.title]))}
              />
            ))}
          </ListSection>
        </List>

        {/* 5 · Article cards: long-press for actions, tap to read */}
        <Stack padding="inline" gap="3">
          <Text variant="title3" weight="bold">Top Stories</Text>
          {ARTICLES.map((a) => (
            <ContextMenu
              key={a.id}
              open={menu === a.id}
              onOpenChange={(o) => setMenu(o ? a.id : null)}
              label={a.title}
              onPress={() => open(a.id)}
              items={[
                { label: saved.includes(a.id) ? "Remove from Saved" : "Save for Later", icon: saved.includes(a.id) ? "bookmark.slash" : "bookmark", onPress: () => { toggleSave(a.id); setMenu(null); } },
                { label: "Share", icon: "square.and.arrow.up" },
                { divider: true },
                { label: "Show Less Like This", icon: "hand.thumbsdown" },
              ]}
            >
              <Card variant="grouped">
                <Stack gap="2">
                  <Media ratio="16:9" radius="small" tone={a.tone} icon={a.icon} />
                  <Stack direction="horizontal" gap="2" align="center">
                    <Text variant="caption1" weight="semibold" color="secondary">{a.source.toUpperCase()}</Text>
                    {saved.includes(a.id) && <Badge value="Saved" tone="accent" />}
                  </Stack>
                  <Text variant="headline">{a.title}</Text>
                  <Text variant="subheadline" color="secondary" lines={2}>{a.summary}</Text>
                  <Text variant="caption1" color="tertiary">{a.time} ago</Text>
                </Stack>
              </Card>
            </ContextMenu>
          ))}
        </Stack>

        {/* 6 · Promo: glass card with a call to action */}
        <Stack padding="inline">
          <Card variant="glass" title="Discover+ is free for a month" icon="sparkles">
            <Stack gap="3">
              <Text variant="subheadline" color="secondary">Ad-free stories, offline reading and early access to events.</Text>
              <Stack direction="horizontal" gap="2">
                <Button variant="glassProminent" label="Try It Free" />
                <Button variant="glass" label="Not Now" />
              </Stack>
            </Stack>
          </Card>
        </Stack>

        {/* 7 · Quick actions grid */}
        <Stack padding="inline" direction="horizontal" justify="between">
          {[["qrcode.viewfinder", "Scan"], ["map.fill", "Nearby"], ["ticket.fill", "Tickets"], ["gift.fill", "Offers"]].map(([icon, label]) => (
            <Stack key={label} align="center" gap="1">
              <IconButton variant="glass" size="large" icon={icon!} label={label!} />
              <Text variant="caption1" color="secondary">{label}</Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Banner open={!!toast} icon="bookmark.fill" title={toast ?? ""} onDismiss={() => setToast(null)} dismissLabel="Dismiss" />
    </Screen>
  );
}

function Article({ id, saved, onSave }: { id: number; saved: boolean; onSave: () => void }) {
  const a = ARTICLES.find((x) => x.id === id)!;
  const [isSaved, setIsSaved] = useState(saved);
  return (
    <Screen
      header={<NavigationBar title="" displayMode="inline" trailing={[{ icon: isSaved ? "bookmark.fill" : "bookmark", label: isSaved ? "Saved" : "Save", onPress: () => { setIsSaved((s) => !s); onSave(); } }, { icon: "square.and.arrow.up", label: "Share", onPress: () => {} }]} />}
    >
      <Stack gap="4">
        <Media ratio="4:3" radius="none" tone={a.tone} icon={a.icon} alt={a.title} />
        <Stack padding="inline" gap="3">
          <Text variant="caption1" weight="semibold" color="secondary">{a.source.toUpperCase()} · {a.time} ago</Text>
          <Text variant="title1" weight="bold">{a.title}</Text>
          <Text variant="title3" color="secondary">{a.summary}</Text>
          <Text paragraph>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec ullamcorper nulla non metus auctor fringilla.</Text>
          <Text paragraph>Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper. Maecenas faucibus mollis interdum. Nullam quis risus eget urna mollis ornare vel eu leo.</Text>
        </Stack>
      </Stack>
    </Screen>
  );
}
