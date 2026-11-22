import { Icon, type IconName } from "./Icon";
import { ProgressView } from "./ProgressView";
import "./Button.css";

export type ButtonVariant = "glassProminent" | "glass" | "borderedProminent" | "bordered" | "borderless" | "plain";
export type ButtonSize = "small" | "regular" | "large";
export type ButtonShape = "capsule" | "roundedRectangle";
export type ButtonRole = "default" | "destructive" | "cancel";

export interface ButtonProps {
  /** Visible title (also the accessible name). */
  label: string;
  /** Button style. Use glassProminent / glass for floating actions, bordered* inside content. */
  variant?: ButtonVariant;
  /** controlSize: small (28pt), regular (34pt), large (50pt). */
  size?: ButtonSize;
  /** buttonBorderShape. */
  shape?: ButtonShape;
  /** destructive tints red; cancel uses semibold weight. */
  role?: ButtonRole;
  /** Leading symbol (Label(title, systemImage:)). */
  icon?: IconName;
  /** Stretch to the container width (e.g. a bottom "Continue" button). */
  fullWidth?: boolean;
  disabled?: boolean;
  /** Replaces the title with a spinner and blocks presses; the title stays the accessible name. */
  loading?: boolean;
  type?: "button" | "submit";
  onPress?: () => void;
  testId?: string;
}

/** Push button. */
export function Button({
  label, variant = "borderedProminent", size = "regular", shape = "capsule", role = "default",
  icon, fullWidth, disabled, loading, type = "button", onPress, testId,
}: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <button
      type={type}
      className="dph-button"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-role={role === "default" ? undefined : role}
      data-full={fullWidth || undefined}
      data-loading={loading || undefined}
      data-testid={testId}
      disabled={disabled}
      aria-disabled={inactive || undefined}
      aria-busy={loading || undefined}
      aria-label={loading ? label : undefined}
      onClick={inactive ? undefined : onPress}
    >
      <span className="dph-button__content">
        {icon && <Icon name={icon} />}
        <span className="dph-button__label">{label}</span>
      </span>
      {loading && <span className="dph-button__spinner"><ProgressView size="small" label={label} /></span>}
    </button>
  );
}
