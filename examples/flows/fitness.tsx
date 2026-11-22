import { useState } from "react";
import {
  NavigationStack, useNavigation, Screen, NavigationBar, TabBar, List, ListSection, ListItem, Card, Chart, Gauge, StatCard,
  Text, Stack, Button, Banner, Media, type ChartDatum, type MediaTone,
} from "../../src/index";
import { account, ME } from "./account";

/**
 * Fitness flow — daily goals (three rings), weekly chart, stat cards, streak and today's workouts.
 * A workout row pushes its detail: summary rows, a small chart, a Start Workout button with loading, then a finished banner.
 */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const week = (vals: number[]): ChartDatum[] => vals.map((value, i) => ({ label: DAYS[i]!, value }));
const MOVE_WEEK = [420, 510, 380, 560, 470, 610, 410];

interface Workout { id: string; title: string; when: string; detail: string; icon: string; tone: MediaTone; kcal: number; minutes: number; bpm: number; dist: string; effort: number[] }
const WORKOUTS: Workout[] = [
  { id: "run", title: "Morning Run", when: "7:10 AM", detail: "32 min · 5.2 km", icon: "flame.fill", tone: "orange", kcal: 348, minutes: 32, bpm: 148, dist: "5.2 km", effort: [118, 132, 141, 150, 156, 149, 144, 138] },
  { id: "walk", title: "Lunch Walk", when: "12:30 PM", detail: "25 min · 2.1 km", icon: "location.fill", tone: "green", kcal: 120, minutes: 25, bpm: 102, dist: "2.1 km", effort: [88, 96, 104, 108, 103, 101, 99, 97] },
  { id: "stretch", title: "Evening Stretch", when: "6:30 PM", detail: "20 min · Planned", icon: "leaf.fill", tone: "teal", kcal: 70, minutes: 20, bpm: 84, dist: "No distance", effort: [70, 76, 80, 82, 85, 83, 79, 74] },
];

export default function FitnessFlow() {
  const [tab, setTab] = useState(0);
  return (
    <NavigationStack backLabel="Activity">
      <Summary tab={tab} onTab={setTab} />
    </NavigationStack>
  );
}

function Summary({ tab, onTab }: { tab: number; onTab: (i: number) => void }) {
  const nav = useNavigation();
  const [sel, setSel] = useState<number | null>(null);
  const rings = [
    { label: "Move", value: 0.82, text: "82%", tint: "danger" as const, caption: "410 of 500 kcal" },
    { label: "Exercise", value: 0.7, text: "21m", tint: "success" as const, caption: "21 of 30 min" },
    { label: "Stand", value: 0.75, text: "9h", tint: "accent" as const, caption: "9 of 12 hours" },
  ];
  return (
    <Screen
      background="grouped"
      header={<NavigationBar title="Activity" subtitle={`Good morning, ${ME.first}`} trailing={[{ icon: "calendar", label: "Choose date", onPress: () => {} }]} account={account(() => onTab(2))} />}
      bottomBar={
        <TabBar
          label="Sections"
          items={[{ icon: "flame.fill", label: "Today" }, { icon: "chart.bar.xaxis", label: "Trends" }, { icon: "person.crop.circle", label: "You" }]}
          selected={tab}
          onChange={onTab}
          minimizeBehavior="onScrollDown"
        />
      }
    >
      <Stack padding="margin" gap="4">
        <Card variant="grouped" title="Daily Goals" icon="target" tint="green">
          <Stack direction="horizontal" justify="between" padding="2">
            {rings.map((r) => (
              <Stack key={r.label} align="center" gap="2" grow>
                <Gauge variant="capacity" value={r.value} label={r.text} currentValueLabel={`${r.label} goal, ${r.caption}`} tint={r.tint} />
                <Stack align="center" gap="none">
                  <Text variant="subheadline" weight="semibold">{r.label}</Text>
                  <Text variant="caption2" color="secondary">{r.caption}</Text>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Card>

        <Stack direction="horizontal" gap="4">
          <Stack grow>
            <Card variant="grouped" title="Streak" icon="flame.fill" tint="orange">
              <Stack gap="none"><Text variant="title1" weight="bold" design="rounded">12 days</Text><Text variant="caption1" color="secondary">All goals met</Text></Stack>
            </Card>
          </Stack>
          <Stack grow>
            <Card variant="grouped" title="Best" icon="star.fill" tint="yellow">
              <Stack gap="none"><Text variant="title1" weight="bold" design="rounded">21 days</Text><Text variant="caption1" color="secondary">Set in September</Text></Stack>
            </Card>
          </Stack>
        </Stack>

        <Card variant="grouped" title="Active Energy" icon="flame.fill" tint="red">
          <Chart
            kind="bar"
            label="Active energy this week"
            data={week(MOVE_WEEK)}
            tint="red"
            height={200}
            barRadius={6}
            axes="minimal"
            summaryLabel="Average"
            summaryValue="480"
            summaryUnit="kcal"
            summaryCaption="This week"
            formatValue={(v) => `${v} kcal`}
            selected={sel}
            onSelect={setSel}
          />
        </Card>

        <Stack direction="horizontal" gap="4">
          <Stack grow><StatCard size="compact" title="Steps" icon="location.fill" tint="orange" value="8,412" trend="up" trendLabel="12%" /></Stack>
          <Stack grow><StatCard size="compact" title="Distance" icon="map.fill" tint="blue" value="6.4" unit="km" trend="up" trendLabel="8%" /></Stack>
        </Stack>
        <StatCard title="Heart Rate" icon="heart.fill" tint="red" label="Resting average" caption="Now" value="58" unit="bpm" history={[61, 60, 59, 60, 58, 59, 58]} chart="line" trend="down" trendLabel="3 bpm vs last week" />
      </Stack>

      <List label="Today's workouts">
        <ListSection header="Today's workouts" footer="Tap a workout to see its summary.">
          {WORKOUTS.map((w) => (
            <ListItem
              key={w.id}
              prominent
              leading={<Media ratio="1:1" radius="small" width={44} tone={w.tone} icon={w.icon} />}
              title={w.title}
              subtitle={w.detail}
              value={w.when}
              accessory="chevron"
              onPress={() => nav?.push(<WorkoutDetail workout={w} />)}
            />
          ))}
        </ListSection>
      </List>
    </Screen>
  );
}

function WorkoutDetail({ workout: w }: { workout: Workout }) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const start = () => { setState("running"); setTimeout(() => setState("done"), 1800); };
  return (
    <Screen background="grouped" header={<NavigationBar title={w.title} subtitle={w.when} displayMode="inline" />}>
      <Stack padding="margin" gap="4">
        <Media ratio="16:9" radius="large" tone={w.tone} icon={w.icon} alt={w.title} />
      </Stack>
      <List label="Workout summary">
        <ListSection header="Summary">
          <ListItem icon="clock" iconColor="orange" title="Duration" value={`${w.minutes} min`} />
          <ListItem icon="flame.fill" iconColor="red" title="Active energy" value={`${w.kcal} kcal`} />
          <ListItem icon="map.fill" iconColor="blue" title="Distance" value={w.dist} />
          <ListItem icon="heart.fill" iconColor="pink" title="Average heart rate" value={`${w.bpm} bpm`} />
        </ListSection>
      </List>
      <Stack padding="margin" gap="4">
        <Card variant="grouped" title="Heart Rate" icon="heart.fill" tint="red">
          <Chart kind="line" label="Heart rate during the workout" data={w.effort.map((value, i) => ({ label: `${i * 4}m`, value }))} tint="red" smooth area axes="minimal" height={140} formatValue={(v) => `${v} bpm`} />
        </Card>
        <Button
          variant="borderedProminent"
          size="large"
          fullWidth
          icon="play.fill"
          label={state === "done" ? "Start Again" : state === "running" ? "Starting" : "Start Workout"}
          loading={state === "running"}
          onPress={start}
        />
      </Stack>
      <Banner open={state === "done"} tone="success" icon="checkmark.circle.fill" title="Workout finished" message={`${w.minutes} minutes and ${w.kcal} kcal. Nice work.`} onDismiss={() => setState("idle")} dismissLabel="Dismiss" />
    </Screen>
  );
}
