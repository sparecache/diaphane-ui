// diaphane-ui: a translucent mobile design system for React. Importing this module loads the fonts and tokens once.
import "./fonts/inter.css";
import "./styles/tokens.css";
import { installGlassRefraction } from "./components/glassRefraction";

// Mobile WebKit only applies :active during touches when a touch listener exists; the glass press states
// (buttons, switch lens, slider lens) rely on it. Passive and global, installed once.
if (typeof document !== "undefined" && !(globalThis as { __dphActiveTouch?: boolean }).__dphActiveTouch) {
  (globalThis as { __dphActiveTouch?: boolean }).__dphActiveTouch = true;
  document.addEventListener("touchstart", () => {}, { passive: true });
}
// Glass edge refraction where the browser can render it (Chromium); a no-op elsewhere.
installGlassRefraction();

export { Text } from "./components/Text";
export type { TextProps, TextVariant, TextColor, TextWeight } from "./components/Text";
export { Icon } from "./components/Icon";
export type { IconProps, IconName, IconScale, IconWeight, IconColor } from "./components/Icon";
export { Button } from "./components/Button";
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonShape, ButtonRole } from "./components/Button";
export { IconButton } from "./components/IconButton";
export type { IconButtonProps, IconButtonVariant, IconButtonSize } from "./components/IconButton";
export { Toggle } from "./components/Toggle";
export type { ToggleProps } from "./components/Toggle";
export { ProgressView } from "./components/ProgressView";
export type { ProgressViewProps, ProgressVariant, ProgressSize, ProgressTint } from "./components/ProgressView";
export { List } from "./components/List";
export type { ListProps, ListStyle } from "./components/List";
export { ListSection } from "./components/ListSection";
export type { ListSectionProps } from "./components/ListSection";
export { ListItem } from "./components/ListItem";
export type { ListItemProps, ListItemAccessory, ListItemRole, ListIconColor, ListItemSwipeEdge, SwipeActionTone, ListItemSwipeAction } from "./components/ListItem";

export { Screen } from "./components/Screen";
export type { ScreenProps, ScreenBackground, ScreenEdgeEffect, ScreenScrollState, ScreenTint } from "./components/Screen";
export { Form } from "./components/Form";
export type { FormProps } from "./components/Form";
export { Card } from "./components/Card";
export type { CardProps, CardVariant } from "./components/Card";
export { Badge } from "./components/Badge";
export type { BadgeProps, BadgeTone } from "./components/Badge";
export { Avatar } from "./components/Avatar";
export type { AvatarProps, AvatarSize } from "./components/Avatar";
export { Checkbox } from "./components/Checkbox";
export type { CheckboxProps } from "./components/Checkbox";

export { TextField } from "./components/TextField";
export type { TextFieldProps, TextFieldVariant, TextFieldType } from "./components/TextField";
export { FieldHint } from "./components/FieldHint";
export type { FieldHintProps, FieldMessagePlacement } from "./components/FieldHint";
export { FieldError } from "./components/FieldError";
export type { FieldErrorProps } from "./components/FieldError";
export { Slider } from "./components/Slider";
export type { SliderProps } from "./components/Slider";
export { Stepper } from "./components/Stepper";
export type { StepperProps } from "./components/Stepper";
export { Picker } from "./components/Picker";
export type { PickerProps, PickerVariant, PickerOption, PickerColumn } from "./components/Picker";
export { DatePicker } from "./components/DatePicker";
export type { DatePickerProps, DatePickerMode, DatePickerVariant } from "./components/DatePicker";

export { NavigationBar } from "./components/NavigationBar";
export type { NavigationBarAccount, NavigationBarDisplayMode, NavigationBarProps } from "./components/NavigationBar";
export { TabBar } from "./components/TabBar";
export type { TabBarItem, TabBarSearchPlacement, TabBarProps, TabBarMinimizeBehavior } from "./components/TabBar";
export { Toolbar } from "./components/Toolbar";
export type { ToolbarProps } from "./components/Toolbar";
export { SearchField } from "./components/SearchField";
export type { SearchFieldPlacement, SearchFieldProps } from "./components/SearchField";
export { SegmentedControl } from "./components/SegmentedControl";
export type { Segment, SegmentedControlProps } from "./components/SegmentedControl";
export { PageControl } from "./components/PageControl";
export type { PageControlProps } from "./components/PageControl";

export { Stack } from "./components/Stack";
export type { StackProps, StackDirection, StackSpace, StackPadding, StackAlign, StackJustify } from "./components/Stack";

export { Alert } from "./components/Alert";
export type { AlertActionRole, AlertAction, AlertProps } from "./components/Alert";
export { ActionSheet } from "./components/ActionSheet";
export type { ActionSheetProps } from "./components/ActionSheet";
export { Sheet } from "./components/Sheet";
export type { SheetDetent, SheetProps } from "./components/Sheet";
export { Menu } from "./components/Menu";
export type { MenuAction, MenuDivider, MenuSection, MenuItem, MenuLayout, MenuProps } from "./components/Menu";
export { ContextMenu } from "./components/ContextMenu";
export type { ContextMenuProps } from "./components/ContextMenu";
export { Gauge } from "./components/Gauge";
export type { GaugeVariant, GaugeTint, GaugeProps } from "./components/Gauge";
export { EmptyState } from "./components/EmptyState";
export type { EmptyStateVariant, EmptyStateAction, EmptyStateProps } from "./components/EmptyState";
export { ErrorState } from "./components/ErrorState";
export type { ErrorStateProps } from "./components/ErrorState";
export { Banner } from "./components/Banner";
export type { BannerTone, BannerProps } from "./components/Banner";

// Icons: built-in Lucide set; register your own or override names.
export { registerIcons, resolveIcon, lucideIcon, lucideSolid, lucideBadge } from "./icons/registry";
export type { IconDef } from "./icons/registry";
export { icons } from "./icons/icons";

export { installGlassRefraction, GLASS_SELECTOR } from "./components/glassRefraction";
export { Glass } from "./components/Glass";
export type { GlassProps, GlassVariant, GlassShape, GlassTint } from "./components/Glass";
export { NavigationStack } from "./components/NavigationStack";
export { useNavigation } from "./components/NavigationStack";
export type { NavigationStackProps, NavigationApi } from "./components/NavigationStack";
export { Chart } from "./components/Chart";
export type { ChartProps, ChartKind, ChartDatum, ChartTint, ChartAxes, ChartHighlight } from "./components/Chart";
export { Media } from "./components/Media";
export type { MediaProps, MediaRatio, MediaRadius, MediaTone } from "./components/Media";
export { StatCard } from "./components/StatCard";
export type { StatCardProps, StatCardSize, StatTrend } from "./components/StatCard";
export { NotificationCard } from "./components/NotificationCard";
export type { NotificationCardProps } from "./components/NotificationCard";
export { Checklist } from "./components/Checklist";
export type { ChecklistProps, ChecklistItem } from "./components/Checklist";
export { Rating } from "./components/Rating";
export { RatingSummary } from "./components/Rating";
export type { RatingProps, RatingSize, RatingTint, RatingSummaryProps } from "./components/Rating";
export { SectionHeader } from "./components/SectionHeader";
export type { SectionHeaderProps } from "./components/SectionHeader";
