import type { ReactNode } from "react";
import type { IconName } from "./Icon";
import { Icon } from "./Icon";
import "./Media.css";

export type MediaRatio = "1:1" | "4:3" | "3:2" | "16:9" | "3:4" | "2:3";
export type MediaRadius = "none" | "small" | "medium" | "large";
export type MediaTone = "blue" | "green" | "orange" | "pink" | "purple" | "teal" | "indigo" | "red" | "yellow" | "gray";

export interface MediaProps {
  /** Image URL. Without it the frame shows a soft gradient placeholder in `tone`. */
  src?: string;
  /** Alternative text; required for meaningful images. Omit only for decorative ones. */
  alt?: string;
  /** Aspect ratio of the frame (the image fills it, cropped). Default 4:3. */
  ratio?: MediaRatio;
  /** Corner radius: small 8, medium 12, large 26 (glass-card concentric). Default medium. */
  radius?: MediaRadius;
  /** Placeholder colour (no src). */
  tone?: MediaTone;
  /** Placeholder fill: soft (default) — a light tint with a tinted symbol, like artwork placeholders in media apps;
   *  vivid — a saturated gradient with a white symbol (app icons, hero art; use sparingly). */
  fill?: "soft" | "vivid";
  /** Symbol centred on the placeholder. */
  icon?: IconName;
  /** Fixed width in points (thumbnails in list rows); default fills the container width. */
  width?: number;
  /** Makes the image tappable (open a photo, a story); it scales down slightly while pressed. Needs `alt`. */
  onPress?: () => void;
  /** Overlay content pinned to the bottom of the frame (a title, a Glass caption, a badge). */
  children?: ReactNode;
  testId?: string;
}

/** Image frame with a fixed aspect ratio (Image.resizable().aspectRatio(contentMode: .fill)), or a placeholder. */
export function Media({ src, alt, ratio = "4:3", radius = "medium", tone = "blue", fill = "soft", icon, width, onPress, children, testId }: MediaProps) {
  return (
    <span className="dph-media" data-ratio={ratio} data-radius={radius} data-tone={tone} data-fill={fill} style={width ? { width, flex: "none" } : undefined} data-pressable={onPress ? "" : undefined} onClick={onPress} data-testid={testId}>
      <span className="dph-media__image" role={onPress ? "button" : alt ? "img" : undefined} tabIndex={onPress ? 0 : undefined} onKeyDown={onPress ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPress(); } } : undefined} aria-label={alt} aria-hidden={alt || onPress ? undefined : true}>
        {src ? <img src={src} alt="" /> : icon && <Icon name={icon} />}
      </span>
      {children && <span className="dph-media__overlay">{children}</span>}
    </span>
  );
}
