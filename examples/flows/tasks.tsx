import { useState } from "react";
import {
  NavigationStack, useNavigation, Screen, NavigationBar, Toolbar, List, ListSection, ListItem, Sheet, Form, TextField, Picker,
  DatePicker, ActionSheet, Banner, EmptyState, Text, Stack, Badge, Checkbox,
} from "../../src/index";

/** CRUD flow — Tasks: create (sheet form), read (pushed detail), update (edit sheet), delete (swipe, multi-select, undo). */
type Priority = "none" | "low" | "medium" | "high";
interface Task { id: number; title: string; notes: string; due: string; priority: Priority; done: boolean; flagged: boolean }

const SEED: Task[] = [
  { id: 1, title: "Book flights", notes: "Window seat, morning departure.", due: "2026-11-21", priority: "high", done: false, flagged: true },
  { id: 2, title: "Review design system tokens", notes: "", due: "2026-11-20", priority: "medium", done: false, flagged: false },
  { id: 3, title: "Pick up dry cleaning", notes: "Ticket #4471", due: "2026-11-22", priority: "none", done: false, flagged: false },
  { id: 4, title: "Call the dentist", notes: "", due: "2026-11-25", priority: "low", done: false, flagged: false },
  { id: 5, title: "Send invoice to Northwind", notes: "", due: "2026-11-18", priority: "medium", done: true, flagged: false },
];
const TODAY = "2026-11-20";
const PRIORITIES = [
  { value: "none", label: "None" }, { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" },
];
const bang: Record<Priority, string> = { none: "", low: "!", medium: "!!", high: "!!!" };
const dayLabel = (d: string) => (d === TODAY ? "Today" : new Date(d + "T12:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }));

export default function TasksFlow() {
  return (
    <NavigationStack backLabel="Back">
      <TasksList />
    </NavigationStack>
  );
}

function TasksList() {
  const nav = useNavigation();
  const [tasks, setTasks] = useState(SEED);
  const [editing, setEditing] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [form, setForm] = useState<Task | null>(null);
  const [deleted, setDeleted] = useState<Task[] | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [swiped, setSwiped] = useState<number | null>(null);

  const save = (t: Task) => setTasks((ts) => (ts.some((x) => x.id === t.id) ? ts.map((x) => (x.id === t.id ? t : x)) : [...ts, t]));
  const remove = (ids: number[]) => {
    setDeleted(tasks.filter((t) => ids.includes(t.id)));
    setTasks((ts) => ts.filter((t) => !ids.includes(t.id)));
    setPicked([]); setEditing(false); setSwiped(null);
  };
  const toggle = (id: number) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const openDetail = (id: number) => nav?.push(<TaskDetail id={id} tasks={tasks} onSave={save} onDelete={(i) => { remove([i]); nav.pop(); }} />);

  const open = tasks.filter((t) => !t.done);
  const today = open.filter((t) => t.due <= TODAY);
  const later = open.filter((t) => t.due > TODAY);
  const done = tasks.filter((t) => t.done);

  const row = (t: Task) => (
    <ListItem
      key={t.id}
      leading={editing ? undefined : <Checkbox label={`Complete ${t.title}`} labelHidden checked={t.done} onChange={() => toggle(t.id)} />}
      title={`${bang[t.priority] ? bang[t.priority] + " " : ""}${t.title}`}
      subtitle={[t.flagged ? "⚑ Flagged" : "", dayLabel(t.due), t.notes].filter(Boolean).join(" · ")}
      accessory={editing ? "none" : "info"}
      selectable={editing}
      selected={picked.includes(t.id)}
      onPress={editing ? () => setPicked((p) => (p.includes(t.id) ? p.filter((x) => x !== t.id) : [...p, t.id])) : () => openDetail(t.id)}
      trailingActions={editing ? undefined : [{ label: "Delete", icon: "trash", tone: "destructive", onPress: () => remove([t.id]) }]}
      leadingActions={editing ? undefined : [{ label: t.flagged ? "Unflag" : "Flag", icon: "flag.fill", tone: "orange", onPress: () => { save({ ...t, flagged: !t.flagged }); setSwiped(null); } }]}
      swiped={swiped === t.id ? "trailing" : undefined}
      onSwipeChange={(e) => setSwiped(e ? t.id : null)}
    />
  );

  return (
    <Screen
      background="grouped"
      header={
        <NavigationBar
          title="Tasks"
          subtitle={`${open.length} open`}
          trailing={[editing ? { label: "Done", variant: "glassProminent", onPress: () => { setEditing(false); setPicked([]); } } : { label: "Edit", onPress: () => setEditing(true) }]}
        />
      }
      bottomBar={
        editing ? (
          <Toolbar
            label="Selection"
            status={picked.length ? `${picked.length} Selected` : "Select Tasks"}
            trailing={[{ icon: "trash", label: "Delete selected", disabled: !picked.length, onPress: () => setConfirmBulk(true) }]}
          />
        ) : (
          <Toolbar
            label="Tasks actions"
            status={`${done.length} Completed`}
            trailing={[{ icon: "plus", label: "New Task", variant: "glassProminent", onPress: () => setForm({ id: Date.now(), title: "", notes: "", due: TODAY, priority: "none", done: false, flagged: false }) }]}
          />
        )
      }
    >
      {tasks.length === 0 ? (
        <EmptyState icon="checklist" title="No Tasks" description="Tasks you add appear here." actions={[{ label: "New Task", variant: "borderedProminent", onPress: () => setForm({ id: Date.now(), title: "", notes: "", due: TODAY, priority: "none", done: false, flagged: false }) }]} />
      ) : (
        <List label="Tasks">
          {today.length > 0 && <ListSection header="Today">{today.map(row)}</ListSection>}
          {later.length > 0 && <ListSection header="Upcoming">{later.map(row)}</ListSection>}
          {done.length > 0 && <ListSection header="Completed">{done.map(row)}</ListSection>}
        </List>
      )}

      <TaskForm task={form} onClose={() => setForm(null)} onSave={(t) => { save(t); setForm(null); }} />

      <ActionSheet
        open={confirmBulk}
        onClose={() => setConfirmBulk(false)}
        title={`Delete ${picked.length} ${picked.length === 1 ? "Task" : "Tasks"}?`}
        actions={[{ label: "Delete", role: "destructive", onPress: () => { remove(picked); setConfirmBulk(false); } }]}
        cancelLabel="Cancel"
      />
      <Banner
        open={!!deleted}
        icon="trash"
        title={deleted && deleted.length > 1 ? `${deleted.length} tasks deleted` : "Task deleted"}
        actionLabel="Undo"
        onAction={() => { setTasks((ts) => [...ts, ...(deleted ?? [])].sort((a, b) => a.id - b.id)); setDeleted(null); }}
        onDismiss={() => setDeleted(null)}
        dismissLabel="Dismiss"
      />
    </Screen>
  );
}

/** Read: pushed detail page with an Edit sheet (update) and Delete (confirmation). */
function TaskDetail({ id, tasks, onSave, onDelete }: { id: number; tasks: Task[]; onSave: (t: Task) => void; onDelete: (id: number) => void }) {
  const [task, setTask] = useState(() => tasks.find((t) => t.id === id)!);
  const [edit, setEdit] = useState<Task | null>(null);
  const [confirm, setConfirm] = useState(false);
  const update = (t: Task) => { setTask(t); onSave(t); };
  return (
    <Screen
      background="grouped"
      header={<NavigationBar title="Details" displayMode="inline" trailing={[{ label: "Edit", onPress: () => setEdit(task) }]} />}
    >
      <Stack padding="margin" gap="2">
        <Text variant="title2" weight="bold">{task.title}</Text>
        {task.notes && <Text color="secondary">{task.notes}</Text>}
        {task.flagged && <Badge value="Flagged" tone="accent" />}
      </Stack>
      <List label="Task details">
        <ListSection>
          <ListItem title="Due" value={dayLabel(task.due)} icon="calendar" iconColor="red" />
          <ListItem title="Priority" value={PRIORITIES.find((p) => p.value === task.priority)!.label} icon="exclamationmark" iconColor="orange" />
          <ListItem title="Completed" icon="checkmark" iconColor="green" accessory="toggle" toggled={task.done} onToggle={(done) => update({ ...task, done })} />
        </ListSection>
        <ListSection>
          <ListItem title="Delete Task" role="destructive" onPress={() => setConfirm(true)} />
        </ListSection>
      </List>
      <TaskForm task={edit} onClose={() => setEdit(null)} onSave={(t) => { update(t); setEdit(null); }} />
      <ActionSheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title="This task will be deleted."
        actions={[{ label: "Delete Task", role: "destructive", onPress: () => { setConfirm(false); onDelete(task.id); } }]}
        cancelLabel="Cancel"
      />
    </Screen>
  );
}

/** Create / update form in a sheet. Unsaved changes block the drag-dismiss and ask before discarding. */
function TaskForm({ task, onClose, onSave }: { task: Task | null; onClose: () => void; onSave: (t: Task) => void }) {
  const [draft, setDraft] = useState<Task | null>(task);
  const [seen, setSeen] = useState<Task | null>(task);
  const [discard, setDiscard] = useState(false);
  if (task !== seen) { setSeen(task); setDraft(task); }
  const d = draft ?? task;
  const dirty = !!task && !!draft && JSON.stringify(task) !== JSON.stringify(draft);
  const isNew = !!task && !task.title;
  const set = (p: Partial<Task>) => setDraft((x) => (x ? { ...x, ...p } : x));
  const close = () => (dirty ? setDiscard(true) : onClose());
  return (
    <Sheet
      open={!!task}
      onClose={close}
      title={isNew ? "New Task" : "Edit Task"}
      cancelLabel="Cancel"
      onCancel={close}
      confirmLabel="Save"
      confirmDisabled={!d?.title.trim()}
      onConfirm={() => d && onSave(d)}
      dismissDisabled={dirty}
      showGrabber
    >
      {d && (
        <Form label="Task">
          <ListSection>
            <TextField variant="form" label="Title" labelHidden placeholder="Title" value={d.title} onChange={(title) => set({ title })} />
            <TextField variant="form" label="Notes" labelHidden placeholder="Notes" value={d.notes} onChange={(notes) => set({ notes })} multiline minLines={3} />
          </ListSection>
          <ListSection>
            <DatePicker label="Due" value={d.due} onChange={(due) => set({ due })} formRow />
            <Picker label="Priority" value={d.priority} options={PRIORITIES} onChange={(p) => set({ priority: p as Priority })} formRow />
            <ListItem title="Flag" icon="flag.fill" iconColor="orange" accessory="toggle" toggled={d.flagged} onToggle={(flagged) => set({ flagged })} />
          </ListSection>
        </Form>
      )}
      <ActionSheet
        open={discard}
        onClose={() => setDiscard(false)}
        actions={[{ label: "Discard Changes", role: "destructive", onPress: () => { setDiscard(false); onClose(); } }]}
        cancelLabel="Keep Editing"
      />
    </Sheet>
  );
}
