import { useMemo, useState } from "react";
import {
  NavigationStack, useNavigation, Screen, NavigationBar, TabBar, List, ListSection, ListItem, Card, Chart, Gauge, Text, Stack,
  SegmentedControl, Sheet, Form, Stepper, Banner, StatCard, NotificationCard, Checklist, Checkbox, Avatar, Badge, Media, Button,
  Toolbar, EmptyState, TextField, DatePicker, type ChartDatum, type ChartTint, type MediaTone,
} from "../../src/index";
import { account, ME } from "./account";

/**
 * Dashboard flow — "Studio", a small-business home: notices, setup checklist, KPI stat cards, dashboard charts
 * (summary header, average rule, comparison bars, this-week-vs-last), goals, top products, to-dos, activity feed,
 * upcoming events. Stat cards push metric details; the bell pushes the notifications inbox.
 */
const usd = (v: number, digits = 0) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: digits }).format(v);
const num = (v: number) => new Intl.NumberFormat().format(Math.round(v));
const WEEK = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];
const series = (vals: number[], labels: string[]): ChartDatum[] => vals.map((value, i) => ({ label: labels[i % labels.length]!, value }));

interface Metric { id: string; title: string; icon: string; tint: ChartTint; unit: string; fmt: (v: number) => string; week: number[]; lastWeek: number[]; month: number[]; year: number[]; kind: "bar" | "line"; total: boolean; about: string }
const METRICS: Metric[] = [
  { id: "revenue", title: "Revenue", icon: "dollarsign.circle.fill", tint: "green", unit: "", fmt: (v) => usd(v), week: [1820, 2410, 1650, 1980, 2240, 1730, 2480], lastWeek: [1600, 2100, 1500, 1890, 1950, 1700, 2150], month: [12900, 13800, 12100, 14320], year: [38, 41, 44, 40, 47, 52, 49, 55, 58, 54, 61, 57].map((k) => k * 1000), kind: "bar", total: true, about: "Revenue is the total of paid orders after discounts and before fees and refunds." },
  { id: "orders", title: "Orders", icon: "shippingbox.fill", tint: "orange", unit: "orders", fmt: num, week: [29, 41, 24, 33, 36, 27, 38], lastWeek: [25, 35, 22, 30, 31, 26, 33], month: [201, 228, 196, 228], year: [690, 720, 760, 700, 810, 870, 840, 900, 950, 910, 990, 960], kind: "bar", total: true, about: "Orders counts every checkout that completed payment, including those later refunded." },
  { id: "visitors", title: "Visitors", icon: "person.2.fill", tint: "blue", unit: "visitors", fmt: num, week: [980, 1310, 1120, 1050, 1190, 1020, 1204], lastWeek: [900, 1200, 1000, 990, 1100, 960, 1080], month: [7900, 8300, 7600, 7876], year: [28, 30, 31, 29, 33, 35, 34, 36, 38, 37, 40, 39].map((k) => k * 1000), kind: "line", total: true, about: "Visitors are unique people who opened your store, counted once per day." },
  { id: "conversion", title: "Conversion", icon: "chart.line.uptrend.xyaxis", tint: "purple", unit: "%", fmt: (v) => v.toFixed(1), week: [3.0, 3.1, 2.1, 3.1, 3.0, 2.6, 3.2], lastWeek: [2.8, 2.9, 2.2, 3.0, 2.8, 2.7, 3.1], month: [2.8, 2.9, 2.7, 2.9], year: [2.4, 2.5, 2.5, 2.6, 2.6, 2.7, 2.7, 2.8, 2.8, 2.8, 2.9, 2.9], kind: "line", total: false, about: "Conversion rate is the share of visitors who placed an order." },
];
const metric = (id: string) => METRICS.find((m) => m.id === id)!;

interface Note { id: number; who: string; initials: string; text: string; time: string; unread: boolean; icon?: string; tone?: "green" | "orange" | "blue" | "red" }
const NOTES: Note[] = [
  { id: 1, who: "New order #1042", initials: "", icon: "bag.fill", tone: "green", text: "Maya Reed ordered 2 items · $86.00", time: "9:38", unread: true },
  { id: 2, who: "Leo Park", initials: "LP", text: "Left a 5-star review: “Beautiful packaging!”", time: "9:12", unread: true },
  { id: 3, who: "Payout sent", initials: "", icon: "banknote.fill", tone: "blue", text: "$1,940.22 is on its way to your bank", time: "8:00", unread: true },
  { id: 4, who: "Low stock", initials: "", icon: "exclamationmark.triangle.fill", tone: "orange", text: "Ceramic Mug (Sand) — 3 left", time: "Yesterday", unread: false },
  { id: 5, who: "Sofia Marin", initials: "SM", text: "Asked about shipping to Canada", time: "Yesterday", unread: false },
  { id: 6, who: "Refund issued", initials: "", icon: "arrow.uturn.backward.circle.fill", tone: "red", text: "Order #1031 · $24.00", time: "Tue", unread: false },
];

export default function DashboardFlow() {
  const [tab, setTab] = useState(0);
  return (
    <NavigationStack backLabel="Back">
      {tab === 0 ? <Home tab={tab} onTab={setTab} /> : tab === 1 ? <Orders tab={tab} onTab={setTab} /> : <Insights tab={tab} onTab={setTab} />}
    </NavigationStack>
  );
}

const tabBar = (tab: number, onTab: (i: number) => void, unread = 0) => (
  <TabBar
    label="Sections"
    items={[{ icon: "house.fill", label: "Home" }, { icon: "shippingbox.fill", label: "Orders", badge: 3 }, { icon: "chart.bar.xaxis", label: "Insights" }]}
    selected={tab}
    onChange={onTab}
    searchLabel={unread ? undefined : undefined}
    minimizeBehavior="onScrollDown"
  />
);

function Home({ tab, onTab }: { tab: number; onTab: (i: number) => void }) {
  const nav = useNavigation();
  const [notes, setNotes] = useState(NOTES);
  const [notice, setNotice] = useState(true);
  const [promo, setPromo] = useState(true);
  const [steps, setSteps] = useState([
    { title: "Add your first products", subtitle: "12 products added", done: true },
    { title: "Set up payments", subtitle: "Wallet and cards", done: true },
    { title: "Add shipping rates", subtitle: "Domestic and international", done: false },
    { title: "Connect your domain", subtitle: "studio.example.com", done: false },
    { title: "Invite your team", subtitle: "Give staff their own logins", done: false },
  ]);
  const [todos, setTodos] = useState([
    { t: "Ship 3 orders", d: "Today", done: false },
    { t: "Reply to Sofia Marin", d: "Today", done: false },
    { t: "Restock Ceramic Mug (Sand)", d: "Tomorrow", done: false },
    { t: "Prepare holiday sale banner", d: "Fri", done: true },
  ]);
  const [newTodo, setNewTodo] = useState(false);
  const [draft, setDraft] = useState({ t: "", d: "2026-11-21" });
  const [goal, setGoal] = useState(60000);
  const [goalSheet, setGoalSheet] = useState(false);
  const [goalDraft, setGoalDraft] = useState(goal);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const unread = notes.filter((n) => n.unread).length;
  const doneSteps = steps.filter((s) => s.done).length;
  const rev = metric("revenue");
  const weekTotal = rev.week.reduce((a, b) => a + b, 0);
  const monthToDate = 52_870;
  const open = (id: string) => nav?.push(<MetricDetail id={id} />);
  const openInbox = () => nav?.push(<Inbox notes={notes} onChange={setNotes} />);

  return (
    <Screen
      background="grouped"
      header={
        <NavigationBar
          title="Home"
          subtitle={`Good morning, ${ME.first}`}
          trailing={[{ icon: unread ? "bell.badge" : "bell", label: unread ? `Notifications, ${unread} unread` : "Notifications", onPress: openInbox }]}
          account={account()}
        />
      }
      bottomBar={tabBar(tab, onTab)}
      onRefresh={() => { setRefreshing(true); setTimeout(() => { setRefreshing(false); setToast("Updated just now"); }, 1200); }}
      refreshing={refreshing}
      refreshLabel="Refreshing"
    >
      <Stack padding="margin" gap="4">
        {notice && (
          <NotificationCard
            icon="shippingbox.fill"
            tint="orange"
            title="3 orders are waiting to ship today."
            message="Ship by 5 PM to keep your next-day promise."
            actionLabel="Review Orders"
            onAction={() => onTab(1)}
            onDismiss={() => setNotice(false)}
            dismissLabel="Dismiss"
          />
        )}

        {doneSteps < steps.length && (
          <Checklist
            title="Finish Setting Up Your Store"
            progressLabel={`${doneSteps} of ${steps.length} complete`}
            items={steps}
            onToggle={(i) => setSteps((s) => { const n = s.map((x, j) => (j === i ? { ...x, done: !x.done } : x)); if (n.every((x) => x.done)) setToast("Your store is ready 🎉"); return n; })}
          />
        )}

        <Stack direction="horizontal" justify="between" align="baseline">
          <Text variant="title2" weight="bold">Today</Text>
          <Button variant="borderless" size="small" label="Edit" />
        </Stack>
        <StatCard title="Revenue" icon={rev.icon} tint="green" caption="9:41" value={usd(2480)} history={rev.week} trend="up" trendLabel="12% vs last Thu" onPress={() => open("revenue")} />
        <StatCard title="Orders" icon="shippingbox.fill" tint="orange" caption="9:38" value="38" unit="orders" history={metric("orders").week} trend="up" trendLabel="5 more than usual" onPress={() => open("orders")} />
        <Stack direction="horizontal" gap="3">
          <Stack grow><StatCard size="compact" title="Visitors" icon="person.2.fill" tint="blue" value="1,204" trend="up" trendLabel="11%" onPress={() => open("visitors")} /></Stack>
          <Stack grow><StatCard size="compact" title="Conversion" icon="chart.line.uptrend.xyaxis" value="3.2" unit="%" trend="flat" trendLabel="Steady" onPress={() => open("conversion")} /></Stack>
        </Stack>
        <StatCard title="Visitors" icon="person.2.fill" tint="blue" label="Latest hour" caption="9:00" value="146" unit="visitors" history={[62, 80, 75, 110, 98, 130, 146]} chart="line" onPress={() => open("visitors")} />

        <Text variant="title2" weight="bold">Highlights</Text>
        <Card variant="grouped">
          <Stack gap="3">
            <Text variant="headline" color="success">Revenue · This Week</Text>
            <Chart
              kind="bar"
              label="Revenue this week"
              data={series(rev.week, WEEK)}
              tint="green"
              height={250}
              barRadius={3}
              rule={weekTotal / 7}
              ruleLabel="AVG"
              summaryLabel="Total"
              summaryValue={usd(weekTotal)}
              summaryCaption="Nov 14–20, 2026"
              formatValue={(v) => usd(v)}
              formatAxis={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : usd(v))}
              selected={sel}
              onSelect={setSel}
            />
          </Stack>
        </Card>

        <Card variant="grouped">
          <Stack gap="3">
            <Text variant="headline" color="accent">Visitors</Text>
            <Text variant="title3" weight="semibold">You're getting more visitors than usual this week.</Text>
            <Stack direction="horizontal" gap="6">
              <Stack gap="none"><Text variant="footnote" weight="semibold" color="accent">● This Week</Text><Text variant="title2" weight="semibold">{num(metric("visitors").week.reduce((a, b) => a + b, 0))}</Text></Stack>
              <Stack gap="none"><Text variant="footnote" weight="semibold" color="secondary">● Last Week</Text><Text variant="title2" weight="semibold" color="secondary">{num(metric("visitors").lastWeek.reduce((a, b) => a + b, 0))}</Text></Stack>
            </Stack>
            <Chart kind="line" label="Visitors this week vs last week" data={series(metric("visitors").week, WEEK.map((d) => d[0]!))} compare={metric("visitors").lastWeek} axes="minimal" smooth area highlight="last" tint="blue" height={150} />
          </Stack>
        </Card>

        <Card variant="grouped">
          <Stack gap="3">
            <Text variant="headline" color="success">Average Order Value</Text>
            <Text variant="title3" weight="semibold">Customers are spending more per order this month.</Text>
            <Chart kind="comparison" label="Average order value by month" unit="per order" tint="green" formatValue={(v) => usd(v, 2)} data={[{ label: "November", value: 62.4 }, { label: "October", value: 54.1 }]} />
          </Stack>
        </Card>

        <Card variant="grouped">
          <Stack gap="3">
            <Text variant="headline" color="warning">Orders</Text>
            <Text variant="title3" weight="semibold">Over the last 7 days you averaged {num(metric("orders").week.reduce((a, b) => a + b, 0) / 7)} orders a day.</Text>
            <Chart kind="bar" label="Orders, last 7 days" data={series(metric("orders").week, WEEK.map((d) => d[0]!))} axes="minimal" highlight="last" barRadius={4} rule={metric("orders").week.reduce((a, b) => a + b, 0) / 7} ruleLabel="AVERAGE" tint="orange" height={140} />
          </Stack>
        </Card>

        <Card variant="grouped" title="Monthly Goal" icon="target" onPress={() => { setGoalDraft(goal); setGoalSheet(true); }}>
          <Stack direction="horizontal" gap="4" align="center">
            <Gauge variant="capacity" value={monthToDate / goal} label="Goal" currentValueLabel={`${Math.round((monthToDate / goal) * 100)}%`} tint="success" />
            <Stack gap="none" grow>
              <Text variant="title3" weight="bold">{usd(monthToDate)}</Text>
              <Text variant="footnote" color="secondary">of {usd(goal)} · 10 days left</Text>
            </Stack>
          </Stack>
        </Card>

        <Stack direction="horizontal" justify="between" align="baseline">
          <Text variant="title2" weight="bold">Top Products</Text>
          <Button variant="borderless" size="small" label="See All" />
        </Stack>
      </Stack>

      <List label="Top products">
        <ListSection>
          {([["Ceramic Mug", "Sand · 42 sold", 1260, "orange", "cup.and.saucer.fill"], ["Linen Tote", "Natural · 31 sold", 1085, "teal", "bag.fill"], ["Candle No. 3", "Fig & Cedar · 27 sold", 864, "purple", "flame.fill"]] as const).map(([t, s, v, tone, icon], i) => (
            <ListItem key={t} prominent leading={<Media ratio="1:1" radius="small" width={44} tone={tone as MediaTone} icon={icon} />} title={`${i + 1}. ${t}`} subtitle={s} value={usd(v)} accessory="chevron" onPress={() => {}} />
          ))}
        </ListSection>
        <ListSection header="To Do" footer={`${todos.filter((t) => !t.done).length} remaining`}>
          {todos.map((t, i) => (
            <ListItem
              key={t.t}
              leading={<Checkbox label={t.t} labelHidden checked={t.done} onChange={() => setTodos((x) => x.map((y, j) => (j === i ? { ...y, done: !y.done } : y)))} />}
              title={t.t}
              value={t.d}
              trailingActions={[{ label: "Delete", icon: "trash", tone: "destructive", onPress: () => setTodos((x) => x.filter((_, j) => j !== i)) }]}
            />
          ))}
          <ListItem title="Add Task" icon="plus" iconColor="blue" role="action" onPress={() => { setDraft({ t: "", d: "2026-11-21" }); setNewTodo(true); }} />
        </ListSection>
        <ListSection header="Recent Activity">
          {notes.slice(0, 4).map((n) => <NoteRow key={n.id} n={n} onPress={openInbox} />)}
          <ListItem title={unread ? `See All · ${unread} Unread` : "See All"} role="action" onPress={openInbox} />
        </ListSection>
        <ListSection header="Upcoming">
          {[["NOV", "22", "Holiday sale goes live", "Sat · 8:00 AM"], ["NOV", "25", "Supplier call — Atelier Lis", "Tue · 3:30 PM"], ["DEC", "01", "Monthly payout", "Mon"]].map(([m, d, t, s]) => (
            <ListItem key={t} prominent leading={<Stack align="center" gap="none"><Text variant="caption2" weight="semibold" color="danger">{m}</Text><Text variant="title3" weight="bold">{d}</Text></Stack>} title={t!} subtitle={s} accessory="chevron" onPress={() => {}} />
          ))}
        </ListSection>
      </List>

      {promo && (
        <Stack padding="margin">
          <NotificationCard icon="sparkles" title="Get More From Studio Pro" message="Advanced reports, abandoned-cart emails and up to 10 staff accounts." actionLabel="Try Free for 1 Month" onAction={() => {}} onDismiss={() => setPromo(false)} dismissLabel="Dismiss" />
        </Stack>
      )}

      <Sheet open={newTodo} onClose={() => setNewTodo(false)} detent="medium" detents={["medium", "large"]} showGrabber title="New Task" cancelLabel="Cancel" onCancel={() => setNewTodo(false)} confirmLabel="Add" confirmDisabled={!draft.t.trim()} onConfirm={() => { setTodos((x) => [{ t: draft.t.trim(), d: new Date(draft.d + "T12:00").toLocaleDateString(undefined, { weekday: "short" }), done: false }, ...x]); setNewTodo(false); setToast("Task added"); }}>
        <Form label="New task">
          <ListSection>
            <TextField variant="form" label="Task" labelHidden placeholder="What needs doing?" value={draft.t} onChange={(t) => setDraft({ ...draft, t })} />
            <DatePicker label="Due" value={draft.d} onChange={(d) => setDraft({ ...draft, d })} formRow />
          </ListSection>
        </Form>
      </Sheet>
      <Sheet open={goalSheet} onClose={() => setGoalSheet(false)} detent="medium" showGrabber title="Monthly Goal" cancelLabel="Cancel" onCancel={() => setGoalSheet(false)} confirmLabel="Save" onConfirm={() => { setGoal(goalDraft); setGoalSheet(false); setToast("Goal updated"); }}>
        <Form label="Monthly goal">
          <ListSection footer="Set a revenue target for the month. Studio tracks progress on your Home screen.">
            <Stepper label="Revenue Goal" value={goalDraft} min={10000} max={200000} step={5000} onChange={setGoalDraft} valueText={usd(goalDraft)} formRow />
          </ListSection>
        </Form>
      </Sheet>
      <Banner open={!!toast} tone="success" icon="checkmark.circle.fill" title={toast ?? ""} onDismiss={() => setToast(null)} dismissLabel="Dismiss" />
    </Screen>
  );
}

function NoteRow({ n, onPress, onRead, onDelete }: { n: Note; onPress?: () => void; onRead?: () => void; onDelete?: () => void }) {
  return (
    <ListItem
      prominent
      leading={
        <Stack direction="horizontal" align="center" gap="2">
          <Badge dot tone={n.unread ? "accent" : "gray"} label={n.unread ? "Unread" : "Read"} />
          {n.icon ? <Media ratio="1:1" radius="small" width={40} tone={n.tone ?? "blue"} icon={n.icon} /> : <Avatar initials={n.initials} name={n.who} />}
        </Stack>
      }
      title={n.who}
      subtitle={n.text}
      value={n.time}
      onPress={onPress ?? onRead}
      leadingActions={onRead ? [{ label: n.unread ? "Read" : "Unread", icon: n.unread ? "envelope.open.fill" : "envelope.badge.fill", tone: "blue", onPress: onRead }] : undefined}
      trailingActions={onDelete ? [{ label: "Delete", icon: "trash", tone: "destructive", onPress: onDelete }] : undefined}
    />
  );
}

function Inbox({ notes: initial, onChange }: { notes: Note[]; onChange: (n: Note[]) => void }) {
  const [notes, setNotes] = useState(initial);
  const [filter, setFilter] = useState(0);
  const update = (n: Note[]) => { setNotes(n); onChange(n); };
  const shown = filter === 0 ? notes : notes.filter((n) => n.unread);
  const unread = notes.filter((n) => n.unread).length;
  return (
    <Screen
      background="grouped"
      header={<NavigationBar title="Notifications" displayMode="inline" subtitle={unread ? `${unread} unread` : undefined} />}
      bottomBar={<Toolbar label="Inbox actions" status={unread ? `${unread} Unread` : "All Caught Up"} trailing={[{ icon: "envelope.open", label: "Mark All as Read", disabled: !unread, onPress: () => update(notes.map((n) => ({ ...n, unread: false }))) }]} />}
    >
      <Stack padding="inline">
        <SegmentedControl label="Filter" segments={[{ label: "All" }, { label: "Unread" }]} selected={filter} onChange={setFilter} />
      </Stack>
      {shown.length ? (
        <List label="Notifications">
          <ListSection>
            {shown.map((n) => (
              <NoteRow key={n.id} n={n} onRead={() => update(notes.map((x) => (x.id === n.id ? { ...x, unread: !x.unread } : x)))} onDelete={() => update(notes.filter((x) => x.id !== n.id))} />
            ))}
          </ListSection>
        </List>
      ) : (
        <EmptyState icon="bell.slash" title="No Unread Notifications" description="You're all caught up." />
      )}
    </Screen>
  );
}

/** Metric detail: range picker, summary header + selectable chart, highlights, about. */
function MetricDetail({ id }: { id: string }) {
  const m = metric(id);
  const [range, setRange] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const data = useMemo(() => (range === 0 ? series(m.week, WEEK) : range === 1 ? series(m.month, ["W1", "W2", "W3", "W4"]) : series(m.year, MONTHS)), [range, m]);
  const sum = data.reduce((a, d) => a + d.value, 0);
  const avg = sum / data.length;
  const figure = m.total ? sum : avg;
  const fmtAxis = (v: number) => (m.id === "revenue" && v >= 1000 ? `$${Math.round(v / 1000)}K` : m.fmt(v));
  const best = data.reduce((a, b) => (b.value > a.value ? b : a));
  return (
    <Screen background="grouped" header={<NavigationBar title={m.title} displayMode="inline" trailing={[{ icon: "square.and.arrow.up", label: "Share", onPress: () => {} }]} />}>
      <Stack padding="margin" gap="4">
        <SegmentedControl label="Range" segments={[{ label: "W" }, { label: "M" }, { label: "Y" }]} selected={range} onChange={(i) => { setRange(i); setSel(null); }} />
        <Chart
          kind={m.kind}
          label={`${m.title} chart`}
          data={data}
          tint={m.tint}
          height={300}
          area
          barRadius={2}
          summaryLabel={m.total ? "Total" : "Average"}
          summaryValue={m.fmt(figure)}
          summaryUnit={m.unit}
          summaryCaption={range === 0 ? "Nov 14–20, 2026" : range === 1 ? "November 2026" : "2026"}
          unit={m.unit}
          formatValue={m.fmt}
          formatAxis={fmtAxis}
          selected={sel}
          onSelect={setSel}
        />
        <Text variant="title2" weight="bold">Highlights</Text>
        <Card variant="grouped">
          <Stack gap="3">
            <Text variant="headline" color={m.tint === "green" ? "success" : m.tint === "orange" ? "warning" : "accent"}>{m.title}</Text>
            <Text variant="title3" weight="semibold">Your {m.title.toLowerCase()} {m.total ? "this week is" : "is"} up compared with last week.</Text>
            <Chart kind="comparison" label={`${m.title} this week vs last week`} tint={m.tint} unit={m.unit} formatValue={m.fmt} data={[{ label: "This Week", value: m.total ? m.week.reduce((a, b) => a + b, 0) : avg }, { label: "Last Week", value: m.total ? m.lastWeek.reduce((a, b) => a + b, 0) : m.lastWeek.reduce((a, b) => a + b, 0) / 7 }]} />
          </Stack>
        </Card>
        <Card variant="grouped">
          <Stack gap="3">
            <Text variant="headline" color="secondary">Best {range === 2 ? "Month" : range === 1 ? "Week" : "Day"}</Text>
            <Text variant="title3" weight="semibold">{best.label} was your strongest {range === 2 ? "month" : range === 1 ? "week" : "day"} with {m.fmt(best.value)}{m.unit ? ` ${m.unit}` : ""}.</Text>
            <Chart kind="bar" label={`${m.title} average`} data={data.map((d) => ({ ...d, label: d.label[0]! }))} axes="minimal" highlight="last" barRadius={4} rule={avg} ruleLabel="AVERAGE" tint={m.tint} height={130} />
          </Stack>
        </Card>
        <Text variant="title2" weight="bold">About {m.title}</Text>
        <Card variant="grouped"><Text>{m.about}</Text></Card>
      </Stack>
    </Screen>
  );
}

function Orders({ tab, onTab }: { tab: number; onTab: (i: number) => void }) {
  const [seg, setSeg] = useState(0);
  const [shipped, setShipped] = useState<number[]>([]);
  const ORDERS = [[1042, "Maya Reed", "2 items", 86], [1041, "Ivy Chen", "1 item", 32], [1040, "Noah Fischer", "4 items", 148], [1039, "Omar Haddad", "1 item", 24], [1038, "Sofia Marin", "3 items", 97]] as const;
  const list = ORDERS.filter(([id], i) => (seg === 0 ? !shipped.includes(id) && i < 3 : seg === 1 ? shipped.includes(id) || i >= 3 : true));
  return (
    <Screen background="grouped" header={<NavigationBar title="Orders" />} bottomBar={tabBar(tab, onTab)}>
      <Stack padding="inline"><SegmentedControl label="Status" segments={[{ label: "To Ship" }, { label: "Shipped" }, { label: "All" }]} selected={seg} onChange={setSeg} /></Stack>
      {list.length ? (
        <List label="Orders">
          <ListSection>
            {list.map(([id, who, items, total]) => (
              <ListItem key={id} prominent leading={<Avatar initials={who.split(" ").map((p) => p[0]).join("")} name={who} />} title={`#${id} · ${who}`} subtitle={items} value={usd(total)}
                trailingActions={seg === 0 ? [{ label: "Ship", icon: "shippingbox.fill", tone: "green", onPress: () => setShipped((s) => [...s, id]) }] : undefined} accessory="chevron" onPress={() => {}} />
            ))}
          </ListSection>
        </List>
      ) : <EmptyState icon="checkmark.seal.fill" title="All Shipped" description="Nothing left to ship today." />}
    </Screen>
  );
}

function Insights({ tab, onTab }: { tab: number; onTab: (i: number) => void }) {
  const nav = useNavigation();
  return (
    <Screen background="grouped" header={<NavigationBar title="Insights" />} bottomBar={tabBar(tab, onTab)}>
      <Stack padding="margin" gap="3">
        {METRICS.map((m) => (
          <StatCard key={m.id} title={m.title} icon={m.icon} tint={m.tint} caption="This week" value={m.total ? m.fmt(m.week.reduce((a, b) => a + b, 0)) : m.fmt(m.week.reduce((a, b) => a + b, 0) / 7)} unit={m.unit} history={m.week} chart={m.kind === "line" ? "line" : "bars"} onPress={() => nav?.push(<MetricDetail id={m.id} />)} />
        ))}
        <Card variant="grouped" title="Sales by Channel" icon="chart.pie.fill">
          <Chart kind="donut" label="Sales by channel" data={[{ label: "Online", value: 58 }, { label: "In store", value: 27 }, { label: "Instagram", value: 11 }, { label: "Other", value: 4 }]} height={200} />
        </Card>
      </Stack>
    </Screen>
  );
}
