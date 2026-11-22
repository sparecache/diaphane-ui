import { lazy, type ComponentType } from "react";

export interface ScreenDef { id: string; group: string; title: string; Component: ComponentType }

function Missing() { return <div className="pg-ref"><p>Not built yet.</p></div>; }

/** Lazy per-file loading: a compile error in one group file only breaks that group's screens. */
const from = (load: () => Promise<Record<string, unknown>>) => (name: string) =>
  lazy(async () => ({ default: ((await load())[name] as ComponentType | undefined) ?? Missing }));

const foundations = from(() => import("./foundations"));
const actions = from(() => import("./actions"));
const lists = from(() => import("./lists"));
const navigation = from(() => import("./navigation"));
const inputs = from(() => import("./inputs"));
const overlays = from(() => import("./overlays"));
const menus = from(() => import("./menus"));
const listsMore = from(() => import("./lists-more"));
const pickers = from(() => import("./pickers"));
const glass = from(() => import("./glass"));
const charts = from(() => import("./charts"));
const example = (load: () => Promise<{ default: ComponentType }>) => lazy(load);

/** Screen registry: one entry per playground screen. */
export const screens: ScreenDef[] = [
  { id: "typography", group: "Foundations", title: "Typography", Component: foundations("TypographyScreen") },
  { id: "icons", group: "Foundations", title: "Icons", Component: foundations("IconsScreen") },
  { id: "icon-catalog", group: "Foundations", title: "Icon catalog", Component: foundations("IconCatalogScreen") },
  { id: "buttons-styles", group: "Actions", title: "Button styles", Component: actions("ButtonStylesScreen") },
  { id: "buttons-sizes", group: "Actions", title: "Button sizes", Component: actions("ButtonSizesScreen") },
  // Lists & layout
  { id: "list-inset-grouped", group: "Layout", title: "Inset grouped list", Component: lists("ListInsetGroupedScreen") },
  { id: "list-plain", group: "Layout", title: "Plain list", Component: lists("ListPlainScreen") },
  { id: "list-selection", group: "Layout", title: "List selection", Component: lists("ListSelectionScreen") },
  { id: "card", group: "Layout", title: "Cards & badges", Component: lists("CardScreen") },
  { id: "scroll-indicator", group: "Layout", title: "Scroll indicator", Component: lists("ScrollIndicatorScreen") },
  { id: "charts", group: "Display", title: "Charts", Component: charts("ChartsScreen") },
  { id: "glass-lab", group: "Foundations", title: "Glass lab", Component: glass("GlassLabScreen") },
  { id: "glass-levels", group: "Foundations", title: "Glass levels", Component: glass("GlassLevelsScreen") },
  // Navigation
  { id: "nav-large", group: "Navigation", title: "Large title nav bar", Component: navigation("NavLargeScreen") },
  { id: "nav-inline", group: "Navigation", title: "Inline nav bar + back", Component: navigation("NavInlineScreen") },
  { id: "nav-search", group: "Navigation", title: "Searchable", Component: navigation("NavSearchScreen") },
  { id: "tabbar", group: "Navigation", title: "Tab bar", Component: navigation("TabBarScreen") },
  { id: "toolbar-bottom", group: "Navigation", title: "Bottom toolbar", Component: navigation("ToolbarBottomScreen") },
  { id: "segmented", group: "Navigation", title: "Segmented control", Component: navigation("SegmentedScreen") },
  { id: "page-control", group: "Navigation", title: "Page control", Component: navigation("PageControlScreen") },
  // Inputs
  { id: "form-controls", group: "Inputs", title: "Form controls", Component: inputs("FormControlsScreen") },
  { id: "sliders", group: "Inputs", title: "Sliders, steppers, toggles", Component: inputs("SlidersScreen") },
  { id: "textfields-form", group: "Inputs", title: "Text fields in a form", Component: inputs("TextFieldsFormScreen") },
  { id: "textfields-standalone", group: "Inputs", title: "Standalone text fields", Component: inputs("TextFieldsStandaloneScreen") },
  // Overlays & feedback
  { id: "alert-two", group: "Overlays", title: "Alert (2 buttons)", Component: overlays("AlertTwoScreen") },
  { id: "alert-stacked", group: "Overlays", title: "Alert (stacked)", Component: overlays("AlertStackedScreen") },
  { id: "alert-field", group: "Overlays", title: "Alert with field", Component: overlays("AlertFieldScreen") },
  { id: "action-sheet", group: "Overlays", title: "Action sheet", Component: overlays("ActionSheetScreen") },
  { id: "sheet-medium", group: "Overlays", title: "Sheet (medium)", Component: overlays("SheetMediumScreen") },
  { id: "sheet-large", group: "Overlays", title: "Sheet (large)", Component: overlays("SheetLargeScreen") },
  { id: "menu", group: "Overlays", title: "Menu", Component: overlays("MenuScreen") },
  { id: "progress", group: "Feedback", title: "Progress", Component: overlays("ProgressScreen") },
  { id: "empty", group: "Feedback", title: "Empty state", Component: overlays("EmptyStateScreen") },
  { id: "empty-search", group: "Feedback", title: "Empty search", Component: overlays("EmptySearchScreen") },
  { id: "banner", group: "Feedback", title: "Banner / toast", Component: overlays("BannerScreen") },
  // Additional screens
  { id: "context-menu", group: "Overlays", title: "Context menu", Component: menus("ContextMenuScreen") },
  { id: "menu-rich", group: "Overlays", title: "Menu (rich)", Component: menus("MenuRichScreen") },
  { id: "list-grouped", group: "Layout", title: "Grouped list", Component: listsMore("ListGroupedScreen") },
  { id: "list-swipe", group: "Layout", title: "Swipe actions", Component: listsMore("ListSwipeScreen") },
  { id: "refresh", group: "Layout", title: "Pull to refresh", Component: listsMore("RefreshScreen") },
  { id: "tabbar-accessory", group: "Navigation", title: "Tab bar + accessory", Component: listsMore("TabBarAccessoryScreen") },
  { id: "tabbar-minimized", group: "Navigation", title: "Tab bar minimized", Component: listsMore("TabBarMinimizedScreen") },
  { id: "datepicker-graphical", group: "Inputs", title: "Date picker (calendar)", Component: pickers("DatePickerGraphicalScreen") },
  { id: "datepicker-wheel", group: "Inputs", title: "Date picker (wheels)", Component: pickers("DatePickerWheelScreen") },
  { id: "picker-wheel", group: "Inputs", title: "Picker (wheel)", Component: pickers("PickerWheelScreen") },
  // Reference screens (examples/), composed only from catalog components.
  { id: "example-settings", group: "Examples", title: "Settings", Component: example(() => import("../../examples/settings")) },
  { id: "example-inbox", group: "Examples", title: "Inbox", Component: example(() => import("../../examples/inbox")) },
  { id: "example-checkout", group: "Examples", title: "Checkout", Component: example(() => import("../../examples/checkout")) },
  // Interactive sample flows (examples/flows/): multi-page apps built only from catalog components.
  { id: "flow-dashboard", group: "Flows", title: "Dashboard & charts", Component: example(() => import("../../examples/flows/dashboard")) },
  { id: "flow-search", group: "Flows", title: "Search & filter", Component: example(() => import("../../examples/flows/search")) },
  { id: "flow-discover", group: "Flows", title: "Cards & lists", Component: example(() => import("../../examples/flows/discover")) },
  { id: "flow-profile", group: "Flows", title: "Profile", Component: example(() => import("../../examples/flows/profile")) },
  { id: "flow-settings", group: "Flows", title: "Settings", Component: example(() => import("../../examples/flows/settings")) },
  { id: "flow-tasks", group: "Flows", title: "Tasks (CRUD)", Component: example(() => import("../../examples/flows/tasks")) },

  // Popular use cases: complete multi-screen examples for the most common kinds of mobile app.
  { id: "flow-onboarding", group: "Use cases", title: "Onboarding & sign in", Component: example(() => import("../../examples/flows/onboarding")) },
  { id: "flow-shop", group: "Use cases", title: "Online shop", Component: example(() => import("../../examples/flows/shop")) },
  { id: "flow-shop-detail", group: "Use cases", title: "Product detail", Component: example(() => import("../../examples/flows/shop").then((m) => ({ default: m.ShopDetailFlow }))) },
  { id: "flow-banking", group: "Use cases", title: "Money & banking", Component: example(() => import("../../examples/flows/banking")) },
  { id: "flow-messages", group: "Use cases", title: "Messaging", Component: example(() => import("../../examples/flows/messages")) },
  { id: "flow-fitness", group: "Use cases", title: "Fitness & activity", Component: example(() => import("../../examples/flows/fitness")) },
  { id: "flow-travel", group: "Use cases", title: "Trip booking", Component: example(() => import("../../examples/flows/travel")) },
];

/** The screens worth opening first: real apps, in this order. Everything else in `screens` is a component specimen. */
export const samples: { id: string; title: string }[] = [
  { id: "flow-fitness", title: "Activity" },
  { id: "flow-shop", title: "Shop" },
  { id: "flow-shop-detail", title: "Product page" },
  { id: "flow-banking", title: "Wallet" },
  { id: "flow-messages", title: "Messages" },
  { id: "flow-travel", title: "Trips" },
  { id: "flow-onboarding", title: "Onboarding" },
  { id: "flow-dashboard", title: "Dashboard" },
  { id: "flow-settings", title: "Settings" },
];
