import { Icon, type IconName } from "./Icon";
import "./IconButton.css";

export type IconButtonVariant = "glassProminent" | "glass" | "borderedProminent" | "bordered" | "borderless" | "plain";
export type IconButtonSize = "small" | "regular" | "large";

export interface IconButtonProps {
  icon: IconName;
  /** Accessible name (required — there is no visible text). */
  label: string;
  /** glass is the default for toolbar and floating circular buttons. */
  variant?: IconButtonVariant;
  /** small 28pt · regular 32pt · large 44pt (toolbar / navigation bar size). */
  size?: IconButtonSize;
  role?: "default" | "destructive";
  disabled?: boolean;
  /** Toggled state for on/off actions (e.g. favorite). */
  selected?: boolean;
  onPress?: () => void;
  testId?: string;
}

/** Circular icon-only button (Button { Image(systemName:) }.buttonBorderShape(.circle)). */
export function IconButton({ icon, label, variant = "glass", size = "regular", role = "default", disabled, selected, onPress, testId }: IconButtonProps) {
  return (
    <button
      type="button"
      className="dph-icon-button"
      data-variant={variant}
      data-size={size}
      data-role={role === "default" ? undefined : role}
      data-testid={testId}
      aria-label={label}
      aria-pressed={selected}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onPress}
    >
      <Icon name={icon} />
    </button>
  );
}
