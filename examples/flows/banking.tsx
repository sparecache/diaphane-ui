import { useState } from "react";
import {
  NavigationStack, useNavigation, Screen, NavigationBar, List, ListSection, ListItem, Avatar, Text, Stack, Button, IconButton,
  Card, Chart, Sheet, Form, TextField, Banner, type ChartDatum,
} from "../../src/index";
import { account, ME } from "./account";

/** Money flow — "Wallet": balance, quick actions, weekly spending chart, recent activity, transaction detail, send sheet with confirmation. */
const money = (v: number, digits = 2) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
type IconColor = "blue" | "green" | "red" | "orange" | "yellow" | "pink" | "purple" | "indigo" | "teal" | "cyan" | "mint" | "brown" | "gray";
interface Tx { id: string; name: string; category: string; amount: number; when: string; icon: string; color: IconColor; ref: string }

const SPENDING: ChartDatum[] = [
  { label: "Mon", value: 32 }, { label: "Tue", value: 58 }, { label: "Wed", value: 24 }, { label: "Thu", value: 91 },
  { label: "Fri", value: 46 }, { label: "Sat", value: 118 }, { label: "Sun", value: 43 },
];
const FIRST_TXS: Tx[] = [
  { id: "t1", name: "Corner Cafe", category: "Food and drink", amount: -6.8, when: "Today, 8:42 AM", icon: "cup.and.saucer", color: "orange", ref: "WL-48210" },
  { id: "t2", name: "Metro Ride", category: "Transport", amount: -2.75, when: "Today, 7:58 AM", icon: "map", color: "blue", ref: "WL-48207" },
  { id: "t3", name: "Salary Deposit", category: "Income", amount: 2850, when: "Yesterday", icon: "arrow.down.right", color: "green", ref: "WL-48155" },
  { id: "t4", name: "Greenleaf Market", category: "Groceries", amount: -64.12, when: "Yesterday", icon: "cart", color: "teal", ref: "WL-48141" },
  { id: "t5", name: "Studio Rent", category: "Housing", amount: -920, when: "Nov 18", icon: "house", color: "indigo", ref: "WL-48032" },
];
const PEOPLE = [
  { id: "p1", name: "Marta Kowal", initials: "MK", handle: "@marta" },
  { id: "p2", name: "Dario Nunez", initials: "DN", handle: "@dario" },
  { id: "p3", name: "Imani Okoro", initials: "IO", handle: "@imani" },
];

export default function BankingFlow() {
  return (
    <NavigationStack backLabel="Wallet">
      <WalletHome />
    </NavigationStack>
  );
}

function WalletHome() {
  const nav = useNavigation();
  const [txs, setTxs] = useState(FIRST_TXS);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const balance = 4826.5 + txs.filter((t) => !FIRST_TXS.includes(t)).reduce((a, t) => a + t.amount, 0);
  const weekTotal = SPENDING.reduce((a, d) => a + d.value, 0);
  const add = (tx: Omit<Tx, "id" | "ref" | "when">) => setTxs((t) => [{ ...tx, id: `t${t.length + 1}`, when: "Just now", ref: `WL-${48300 + t.length}` }, ...t]);
  const actions = [
    { icon: "paperplane", label: "Send", variant: "glassProminent" as const, run: () => setSending(true) },
    { icon: "arrow.down.right", label: "Request", variant: "glass" as const, run: () => setToast("Request link copied") },
    { icon: "plus", label: "Top Up", variant: "glass" as const, run: () => { add({ name: "Top Up", category: "Income", amount: 100, icon: "plus", color: "green" }); setToast("Added $100.00 to your balance"); } },
    { icon: "ellipsis", label: "More", variant: "glass" as const, run: () => setToast("More actions are on the way") },
  ];

  return (
    <Screen
      background="grouped"
      header={<NavigationBar title="Wallet" subtitle={`Good morning, ${ME.first}`} trailing={[{ icon: "bell", label: "Notifications", onPress: () => setToast("You are all caught up") }]} account={account()} />}
    >
      <Stack padding="margin" gap="4">
        <Card variant="grouped">
          <Stack gap="2">
            <Text variant="subheadline" color="secondary">Available balance</Text>
            <Text variant="largeTitle" weight="bold" design="rounded">{money(balance)}</Text>
            <Stack direction="horizontal" gap="2" align="center">
              <Text variant="subheadline" weight="semibold" color="success">+{money(312.4)}</Text>
              <Text variant="subheadline" color="secondary">this month</Text>
            </Stack>
          </Stack>
        </Card>

        <Stack direction="horizontal" gap="2">
          {actions.map((a) => (
            <Stack key={a.label} align="center" gap="2" grow>
              <IconButton variant={a.variant} size="large" icon={a.icon} label={a.label} onPress={a.run} />
              <Text variant="caption1" color="secondary">{a.label}</Text>
            </Stack>
          ))}
        </Stack>

        <Card variant="grouped" title="Spending" icon="chart.bar.xaxis" tint="blue">
          <Chart
            kind="bar"
            label="Spending this week"
            data={SPENDING}
            height={200}
            barRadius={6}
            axes="minimal"
            formatValue={(v) => money(v, 0)}
            formatAxis={(v) => `$${v}`}
            summaryLabel="This week"
            summaryValue={money(weekTotal)}
            summaryCaption="Nov 16 to Nov 22"
            selected={sel}
            onSelect={setSel}
          />
        </Card>
      </Stack>

      <List label="Recent activity">
        <ListSection header="Recent activity">
          {txs.map((t) => (
            <ListItem
              key={t.id}
              prominent
              icon={t.icon}
              iconColor={t.color}
              title={t.name}
              subtitle={t.category}
              value={`${t.amount > 0 ? "+" : "-"}${money(Math.abs(t.amount))}`}
              accessory="chevron"
              onPress={() => nav?.push(<Detail tx={t} />)}
            />
          ))}
        </ListSection>
      </List>

      <SendSheet
        open={sending}
        balance={balance}
        onClose={() => setSending(false)}
        onSent={(amount, to) => {
          setSending(false);
          add({ name: to.name, category: "Transfer", amount: -amount, icon: "paperplane", color: "purple" });
          setToast(`${money(amount)} sent to ${to.name}`);
        }}
      />
      <Banner open={!!toast} tone="success" icon="checkmark.circle.fill" title={toast ?? ""} onDismiss={() => setToast(null)} dismissLabel="Dismiss" />
    </Screen>
  );
}

function SendSheet({ open, balance, onClose, onSent }: { open: boolean; balance: number; onClose: () => void; onSent: (amount: number, to: (typeof PEOPLE)[number]) => void }) {
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState(PEOPLE[0]!.id);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const value = Number.parseFloat(amount);
  const tooMuch = value > balance;
  const valid = value > 0 && !tooMuch;
  const send = () => {
    setBusy(true);
    setTimeout(() => { setBusy(false); setAmount(""); setNote(""); onSent(value, PEOPLE.find((p) => p.id === to)!); }, 1100);
  };
  return (
    <Sheet open={open} onClose={onClose} title="Send Money" cancelLabel="Cancel" onCancel={onClose} showGrabber>
      <Form label="Send money">
        <ListSection header="Amount" footer={`Available: ${money(balance)}`} footerError={tooMuch}>
          <TextField variant="form" type="number" label="Amount (USD)" placeholder="0.00" value={amount} onChange={setAmount} invalid={tooMuch} errorText={tooMuch ? "That is more than your balance." : undefined} />
        </ListSection>
        <ListSection header="To">
          {PEOPLE.map((p) => (
            <ListItem key={p.id} leading={<Avatar initials={p.initials} name={p.name} />} title={p.name} subtitle={p.handle} accessory={to === p.id ? "checkmark" : "none"} onPress={() => setTo(p.id)} />
          ))}
        </ListSection>
        <ListSection>
          <TextField variant="form" label="Note" placeholder="Optional" value={note} onChange={setNote} />
        </ListSection>
      </Form>
      <Stack padding="margin">
        <Button variant="borderedProminent" size="large" fullWidth label={valid ? `Send ${money(value)}` : "Send"} loading={busy} disabled={!valid} onPress={send} />
      </Stack>
    </Sheet>
  );
}

function Detail({ tx }: { tx: Tx }) {
  const incoming = tx.amount > 0;
  return (
    <Screen background="grouped" header={<NavigationBar title="Details" displayMode="inline" trailing={[{ icon: "square.and.arrow.up", label: "Share receipt", onPress: () => {} }]} />}>
      <Stack padding="margin" align="center" gap="2">
        <Avatar icon={tx.icon} name={tx.name} size="large" />
        <Text variant="headline">{tx.name}</Text>
        <Text variant="largeTitle" weight="bold" design="rounded" color={incoming ? "success" : "primary"}>{incoming ? "+" : "-"}{money(Math.abs(tx.amount))}</Text>
        <Text variant="subheadline" color="secondary">{tx.when}</Text>
      </Stack>
      <List label="Transaction details">
        <ListSection>
          <ListItem title="Status" value="Completed" />
          <ListItem title="Category" value={tx.category} />
          <ListItem title="Date" value={tx.when} />
          <ListItem title="Paid with" value="Wallet balance" />
          <ListItem title="Reference" value={tx.ref} />
        </ListSection>
        <ListSection>
          <ListItem title="Report a Problem" role="action" onPress={() => {}} />
        </ListSection>
      </List>
    </Screen>
  );
}
