// Overlay and feedback screens (alerts, sheets, menus, progress, empty states).
import { useState, type CSSProperties, type ReactNode } from "react";
import { Text } from "../../src/components/Text";
import { Button } from "../../src/components/Button";
import { List } from "../../src/components/List";
import { ListSection } from "../../src/components/ListSection";
import { ListItem } from "../../src/components/ListItem";
import { ProgressView } from "../../src/components/ProgressView";
import { Alert } from "../../src/components/Alert";
import { ActionSheet } from "../../src/components/ActionSheet";
import { Sheet } from "../../src/components/Sheet";
import { Menu } from "../../src/components/Menu";
import { Gauge } from "../../src/components/Gauge";
import { EmptyState } from "../../src/components/EmptyState";
import { Banner } from "../../src/components/Banner";

const noop = () => {};

/** OverlayBackdrop: NavigationStack { List { Row 1…8 } .navigationTitle("Library") } — large title drawn with Text
 *  (54pt bar + 3.67pt to the 40.67pt title line, list 7.67pt below it) until NavigationBar lands. */
function LibraryBackdrop({ children }: { children?: ReactNode }) {
  return (
    <div className="pg-ref grouped">
      <div style={{ padding: "57.667px 16px 7.667px" }}>
        <Text as="h1" variant="largeTitle" weight="bold">Library</Text>
      </div>
      <List>
        <ListSection>
          {Array.from({ length: 8 }, (_, i) => <ListItem key={i} title={`Row ${i + 1}`} />)}
        </ListSection>
      </List>
      {children}
    </div>
  );
}

export function AlertTwoScreen() {
  return (
    <LibraryBackdrop>
      <Alert
        open
        onClose={noop}
        title="Delete Photo?"
        message="This photo will be deleted from all your devices."
        actions={[{ label: "Cancel", role: "cancel" }, { label: "Delete", role: "destructive" }]}
      />
    </LibraryBackdrop>
  );
}

export function AlertStackedScreen() {
  return (
    <LibraryBackdrop>
      <Alert
        open
        onClose={noop}
        title="Save Changes?"
        message="Your changes will be lost if you don't save them."
        actions={[{ label: "Save" }, { label: "Don't Save", role: "destructive" }, { label: "Cancel", role: "cancel" }]}
      />
    </LibraryBackdrop>
  );
}

/** The software keyboard is shown up (328pt incl. the home indicator); the frame reports it through
 *  --dph-keyboard-inset so the alert centers above it. The keyboard itself is system UI and is not drawn. */
export function AlertFieldScreen() {
  const [name, setName] = useState("");
  return (
    <div style={{ ["--dph-keyboard-inset" as string]: "328px" } as CSSProperties}>
      <LibraryBackdrop>
        <Alert
          open
          onClose={noop}
          title="New Folder"
          message="Enter a name for this folder."
          fieldPlaceholder="Name" fieldValue={name} onFieldChange={setName}
          actions={[{ label: "Cancel", role: "cancel" }, { label: "Save" }]}
        />
      </LibraryBackdrop>
    </div>
  );
}

export function ActionSheetScreen() {
  return (
    <LibraryBackdrop>
      <ActionSheet
        open
        onClose={noop}
        title="Photo Options"
        message="Choose what to do with this photo."
        actions={[{ label: "Share" }, { label: "Duplicate" }, { label: "Delete Photo", role: "destructive" }, { label: "Cancel", role: "cancel" }]}
      />
    </LibraryBackdrop>
  );
}

/** An inset-grouped List puts 35pt above its first header-less section under an inline navigation bar. */
const listTopInset: CSSProperties = { paddingTop: 35 };

export function SheetMediumScreen() {
  return (
    <LibraryBackdrop>
      <Sheet open onClose={noop} detent="medium" showGrabber title="Details" cancelLabel="Cancel" confirmLabel="Done">
        <div style={listTopInset}>
          <List>
            <ListSection>
              {["Name", "Email", "Phone"].map((t) => <ListItem key={t} title={t} value="—" />)}
            </ListSection>
          </List>
        </div>
      </Sheet>
    </LibraryBackdrop>
  );
}

export function SheetLargeScreen() {
  return (
    <LibraryBackdrop>
      <Sheet open onClose={noop} detent="large" showGrabber title="New Event" cancelLabel="Cancel" confirmLabel="Add">
        <div style={listTopInset}>
          <List>
            <ListSection>
              {Array.from({ length: 6 }, (_, i) => <ListItem key={i} title={`Item ${i + 1}`} />)}
            </ListSection>
          </List>
        </div>
      </Sheet>
    </LibraryBackdrop>
  );
}

/** Rendered open (the "Sort" menu). */
export function MenuScreen() {
  const [open, setOpen] = useState(true);
  return (
    <div className="pg-ref">
      <Menu
        open={open}
        onOpenChange={setOpen}
        label="Sort"
        trigger={<Button label="Sort" variant="bordered" onPress={() => setOpen(true)} />}
        items={[
          { label: "Name", icon: "textformat" },
          { label: "Date", icon: "calendar" },
          { divider: true },
          { label: "Delete", icon: "trash", role: "destructive" },
        ]}
      />
    </div>
  );
}

const col = (gap: number): CSSProperties => ({ display: "flex", flexDirection: "column", alignItems: "stretch", gap, alignSelf: "stretch" });

/** Playground screen: progress indicators, stacked with 28pt spacing. */
export function ProgressScreen() {
  return (
    <div className="pg-ref">
      <div style={col(28)}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <ProgressView />
          <ProgressView size="large" />
          <ProgressView tint="blue" />
        </div>
        <div><ProgressView label="Loading…" showLabel /></div>
        <ProgressView variant="linear" value={0.4} label="Progress" />
        <ProgressView variant="linear" value={0.7} label="Downloading" showLabel currentValueLabel="70%" />
        <ProgressView variant="linear" value={0.25} label="Progress" tint="green" />
        <div style={{ display: "flex", gap: 24 }}>
          <Gauge value={0.6} variant="capacity" label="Battery" />
          <Gauge value={0.3} variant="value" label="T" currentValueLabel="30" />
        </div>
      </div>
    </div>
  );
}

/** ContentUnavailableView centers in its container: the plain one on the safe area, .search on the full screen. */
export function EmptyStateScreen() {
  return (
    <div className="pg-ref" style={{ height: "100vh", paddingBottom: "var(--dph-safe-bottom)", paddingInline: 0 }}>
      <EmptyState
        icon="tray"
        title="No Messages"
        description="New messages you receive will appear here."
        actions={[{ label: "Refresh", onPress: noop }]}
      />
    </div>
  );
}

export function EmptySearchScreen() {
  return (
    <div className="pg-ref" style={{ height: "100vh", paddingTop: 0, paddingBottom: 2.667, paddingInline: 0 }}>
      <EmptyState variant="search" title="No Results for “{query}”" query="Lorem" description="Check the spelling or try a new search." />
    </div>
  );
}

/** A success toast over the Library backdrop. */
export function BannerScreen() {
  const [open, setOpen] = useState(true);
  return (
    <LibraryBackdrop>
      <Banner
        open={open}
        tone="success"
        title="Photo Saved"
        message="Added to your Library and shared with 2 people."
        actionLabel="Undo" onAction={() => setOpen(false)}
        onDismiss={() => setOpen(false)}
        dismissLabel="Dismiss"
      />
    </LibraryBackdrop>
  );
}
