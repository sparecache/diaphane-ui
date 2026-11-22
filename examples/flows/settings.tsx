import { useEffect, useState } from "react";
import {
  NavigationStack, useNavigation, Screen, NavigationBar, List, ListSection, ListItem, Avatar, Slider, Alert, ActionSheet, ProgressView,
  Picker, Stack, Text, Banner, SearchField,
} from "../../src/index";
import { ME } from "./account";

/** Settings flow — drill-down navigation, toggles, a checkmark picker page, Wi-Fi join with password alert, destructive reset. */
export default function SettingsFlow() {
  return (
    <NavigationStack backLabel="Settings">
      <SettingsRoot />
    </NavigationStack>
  );
}

function SettingsRoot() {
  const nav = useNavigation();
  const [airplane, setAirplane] = useState(false);
  const [wifi, setWifi] = useState("Home");
  const [appearance, setAppearance] = useState("automatic");
  const [query, setQuery] = useState("");
  const rows = [
    { title: "General", icon: "gearshape.fill", color: "gray" as const, page: () => <General /> },
    { title: "Display & Brightness", icon: "sun.max.fill", color: "blue" as const, page: () => <Display appearance={appearance} onAppearance={setAppearance} /> },
    { title: "Notifications", icon: "bell.badge.fill", color: "red" as const, page: () => <Notifications /> },
    { title: "Privacy & Security", icon: "hand.raised.fill", color: "blue" as const, page: () => <General /> },
  ];
  const hits = rows.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()));
  return (
    <Screen
      background="grouped"
      header={<NavigationBar title="Settings" />}
      bottomBar={<SearchField value={query} placeholder="Search" onChange={setQuery} onCancel={() => setQuery("")} clearLabel="Clear text" cancelLabel="Close search" />}
    >
      <List label="Settings">
        {!query && (
          <ListSection>
            <ListItem prominent leading={<Avatar src={ME.src} initials={ME.initials} name={ME.name} size="large" />} title={ME.name} subtitle="Account, sync, and more" accessory="chevron" onPress={() => nav?.push(<General />)} />
          </ListSection>
        )}
        {!query && (
          <ListSection>
            <ListItem title="Airplane Mode" icon="airplane" iconColor="orange" accessory="toggle" toggled={airplane} onToggle={setAirplane} />
            <ListItem title="Wi‑Fi" icon="wifi" iconColor="blue" value={airplane ? "Off" : wifi || "Not Connected"} accessory="chevron" onPress={() => nav?.push(<WiFi current={wifi} onJoin={setWifi} />)} />
            <ListItem title="Bluetooth" icon="bluetooth" iconColor="blue" value="On" accessory="chevron" onPress={() => {}} />
          </ListSection>
        )}
        <ListSection>
          {hits.map((r) => <ListItem key={r.title} title={r.title} icon={r.icon} iconColor={r.color} badge={r.title === "General" ? 1 : undefined} accessory="chevron" onPress={() => nav?.push(r.page())} />)}
        </ListSection>
      </List>
    </Screen>
  );
}

function General() {
  const nav = useNavigation();
  const [reset, setReset] = useState(false);
  const [erase, setErase] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <Screen background="grouped" header={<NavigationBar title="General" displayMode="inline" />}>
      <List label="General">
        <ListSection>
          <ListItem title="About" icon="info.circle.fill" iconColor="gray" accessory="chevron" onPress={() => nav?.push(<About />)} />
          <ListItem title="Software Update" icon="gearshape.fill" iconColor="gray" badge={1} accessory="chevron" onPress={() => nav?.push(<Update />)} />
        </ListSection>
        <ListSection>
          <ListItem title="Phone Storage" accessory="chevron" onPress={() => {}} />
          <ListItem title="Background App Refresh" accessory="chevron" onPress={() => {}} />
        </ListSection>
        <ListSection>
          <ListItem title="Transfer or Reset Phone" accessory="chevron" onPress={() => setReset(true)} />
        </ListSection>
      </List>
      <ActionSheet
        open={reset}
        onClose={() => setReset(false)}
        title="Reset"
        actions={[
          { label: "Reset All Settings", onPress: () => { setReset(false); setDone(true); } },
          { label: "Erase All Content and Settings", role: "destructive", onPress: () => { setReset(false); setErase(true); } },
        ]}
        cancelLabel="Cancel"
      />
      <Alert
        open={erase}
        onClose={() => setErase(false)}
        title="Erase phone?"
        message="This will delete all media and data, and reset all settings. This cannot be undone."
        actions={[{ label: "Cancel", role: "cancel" }, { label: "Erase", role: "destructive", onPress: () => setErase(false) }]}
      />
      <Banner open={done} tone="success" icon="checkmark.circle.fill" title="Settings reset" onDismiss={() => setDone(false)} dismissLabel="Dismiss" />
    </Screen>
  );
}

function About() {
  const nav = useNavigation();
  const [name, setName] = useState("Jane's Phone");
  const [rename, setRename] = useState(false);
  const [draft, setDraft] = useState(name);
  return (
    <Screen background="grouped" header={<NavigationBar title="About" displayMode="inline" />}>
      <List label="About">
        <ListSection>
          <ListItem title="Name" value={name} accessory="chevron" onPress={() => { setDraft(name); setRename(true); }} />
          <ListItem title="System Version" value="27.2" accessory="chevron" onPress={() => nav?.push(<Update />)} />
          <ListItem title="Model Name" value="Phone Pro" />
          <ListItem title="Model Number" value="MG8H4LL/A" />
          <ListItem title="Serial Number" value="F2LXK9QWMN" />
        </ListSection>
        <ListSection>
          <ListItem title="Songs" value="1,204" />
          <ListItem title="Photos" value="18,331" />
          <ListItem title="Capacity" value="256 GB" />
          <ListItem title="Available" value="91.4 GB" />
        </ListSection>
      </List>
      <Alert
        open={rename}
        onClose={() => setRename(false)}
        title="Rename phone"
        fieldLabel="Name"
        fieldValue={draft}
        onFieldChange={setDraft}
        actions={[{ label: "Cancel", role: "cancel" }, { label: "Save", onPress: () => { if (draft.trim()) setName(draft.trim()); setRename(false); } }]}
      />
    </Screen>
  );
}

function Update() {
  const [state, setState] = useState<"idle" | "downloading" | "ready">("idle");
  const [p, setP] = useState(0);
  useEffect(() => {
    if (state !== "downloading") return;
    const t = setInterval(() => setP((x) => { if (x >= 1) { setState("ready"); return 1; } return Math.min(1, x + 0.04); }), 120);
    return () => clearInterval(t);
  }, [state]);
  return (
    <Screen background="grouped" header={<NavigationBar title="Software Update" displayMode="inline" />}>
      <List label="Software update">
        <ListSection>
          <ListItem title="Automatic Updates" value="On" accessory="chevron" onPress={() => {}} />
        </ListSection>
        <ListSection footer="System 27.2.1 includes bug fixes and security updates for your phone.">
          <ListItem prominent icon="gearshape.fill" iconColor="gray" title="System 27.2.1" subtitle="Acme Inc. · 812.4 MB" />
          {state === "idle" && <ListItem title="Update Now" role="action" onPress={() => setState("downloading")} />}
          {state === "ready" && <ListItem title="Install Now" role="action" onPress={() => setState("idle")} />}
        </ListSection>
      </List>
      {state === "downloading" && (
        <Stack padding="margin" gap="2">
          <ProgressView variant="linear" value={p} label="Downloading" showLabel currentValueLabel={`${Math.round(p * 100)}%`} />
          <Text variant="footnote" color="secondary">About {Math.max(1, Math.round((1 - p) * 4))} minutes remaining</Text>
        </Stack>
      )}
    </Screen>
  );
}

function Display({ appearance, onAppearance }: { appearance: string; onAppearance: (v: string) => void }) {
  const nav = useNavigation();
  const [brightness, setBrightness] = useState(0.7);
  const [textSize, setTextSize] = useState(3);
  const [bold, setBold] = useState(false);
  const [lock, setLock] = useState("30 seconds");
  return (
    <Screen background="grouped" header={<NavigationBar title="Display & Brightness" displayMode="inline" />}>
      <List label="Display">
        <ListSection header="Appearance">
          <Picker label="Appearance" labelHidden variant="segmented" formRow value={appearance} onChange={onAppearance} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "automatic", label: "Automatic" }]} />
        </ListSection>
        <ListSection header="Brightness">
          <Slider label="Brightness" value={brightness} onChange={setBrightness} minIcon="sun.min" maxIcon="sun.max.fill" formRow />
        </ListSection>
        <ListSection header="Text">
          <Slider label="Text Size" value={textSize} min={0} max={6} step={1} showTicks onChange={setTextSize} minIcon="textformat.size.smaller" maxIcon="textformat.size.larger" formRow />
          <ListItem title="Bold Text" accessory="toggle" toggled={bold} onToggle={setBold} />
        </ListSection>
        <ListSection>
          <ListItem title="Auto-Lock" value={lock} accessory="chevron" onPress={() => nav?.push(<ChoicePage title="Auto-Lock" options={["30 seconds", "1 minute", "2 minutes", "5 minutes", "Never"]} value={lock} onChange={setLock} />)} />
        </ListSection>
      </List>
    </Screen>
  );
}

/** A pushed selection page (Picker with .navigationLink style): checkmark on the chosen row. */
function ChoicePage({ title, options, value, onChange }: { title: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <Screen background="grouped" header={<NavigationBar title={title} displayMode="inline" />}>
      <List label={title}>
        <ListSection footer="Phone locks automatically after the selected time.">
          {options.map((o) => <ListItem key={o} title={o} accessory={v === o ? "checkmark" : "none"} onPress={() => { setV(o); onChange(o); }} />)}
        </ListSection>
      </List>
    </Screen>
  );
}

function Notifications() {
  const nav = useNavigation();
  const [preview, setPreview] = useState("When Unlocked");
  const [apps, setApps] = useState<Record<string, boolean>>({ Mail: true, Messages: true, Calendar: false, Photos: true });
  return (
    <Screen background="grouped" header={<NavigationBar title="Notifications" displayMode="inline" />}>
      <List label="Notifications">
        <ListSection>
          <ListItem title="Show Previews" value={preview} accessory="chevron" onPress={() => nav?.push(<ChoicePage title="Show Previews" options={["Always", "When Unlocked", "Never"]} value={preview} onChange={setPreview} />)} />
        </ListSection>
        <ListSection header="Notification Style">
          {Object.entries(apps).map(([app, on]) => (
            <ListItem key={app} title={app} subtitle={on ? "Banners, Sounds, Badges" : "Off"} accessory="toggle" toggled={on} onToggle={(v) => setApps({ ...apps, [app]: v })} />
          ))}
        </ListSection>
      </List>
    </Screen>
  );
}

function WiFi({ current, onJoin }: { current: string; onJoin: (n: string) => void }) {
  const [on, setOn] = useState(true);
  const [joined, setJoined] = useState(current);
  const [joining, setJoining] = useState<string | null>(null);
  const [ask, setAsk] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [scanning, setScanning] = useState(true);
  useEffect(() => { const t = setTimeout(() => setScanning(false), 1400); return () => clearTimeout(t); }, []);
  const join = (n: string) => { setJoining(n); setTimeout(() => { setJoined(n); onJoin(n); setJoining(null); }, 900); };
  const networks = [{ n: "Home", lock: true }, { n: "Café Guest", lock: false }, { n: "Office", lock: true }, { n: "Neighbours 5G", lock: true }];
  return (
    <Screen background="grouped" header={<NavigationBar title="Wi‑Fi" displayMode="inline" trailing={[{ label: "Edit", onPress: () => {} }]} />}>
      <List label="Wi-Fi">
        <ListSection>
          <ListItem title="Wi‑Fi" icon="wifi" iconColor="blue" accessory="toggle" toggled={on} onToggle={setOn} />
          {on && joined && <ListItem title={joined} subtitle="Connected" accessory="info" onPress={() => {}} />}
        </ListSection>
        {on && (
          <ListSection header="Networks">
            {networks.filter((x) => x.n !== joined).map((x) => (
              <ListItem
                key={x.n}
                title={x.n}
                subtitle={joining === x.n ? "Joining…" : x.lock ? "Secured" : "Open"}
                accessory="info"
                onPress={() => (x.lock ? (setPw(""), setAsk(x.n)) : join(x.n))}
              />
            ))}
            {scanning && <Stack padding="margin" align="center"><ProgressView label="Searching for networks" /></Stack>}
          </ListSection>
        )}
      </List>
      <Alert
        open={!!ask}
        onClose={() => setAsk(null)}
        title={`Enter the password for “${ask ?? ""}”`}
        fieldLabel="Password"
        fieldPlaceholder="Password"
        fieldValue={pw}
        onFieldChange={setPw}
        actions={[{ label: "Cancel", role: "cancel" }, { label: "Join", onPress: () => { if (ask && pw.length >= 8) join(ask); setAsk(null); } }]}
      />
    </Screen>
  );
}
