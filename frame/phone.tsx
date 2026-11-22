import type { ReactNode } from "react";
import "../src/styles/tokens.css";
import "./phone.css";

export interface FrameProps {
  children?: ReactNode;
  theme?: "light" | "dark";
  dir?: "ltr" | "rtl";
  /** Design version for version-scoped CSS (`data-os-version`). */
  osVersion?: string;
  /** Status bar glyph color: auto follows the theme; light = white glyphs (over dark content), dark = black glyphs. */
  statusBarStyle?: "auto" | "light" | "dark";
  /** Draw a plain device bezel around the 402×874 screen. */
  bezel?: boolean;
  /** Status bar clock text. */
  time?: string;
  /** "high" = high-contrast palette; every text pair passes WCAG AA (opt-in; default is the standard palette). */
  contrast?: "standard" | "high";
  /** Text size step (xSmall … AX5); Large is the default. */
  textSize?: TextSize;
}

export type TextSize = "xSmall" | "small" | "medium" | "large" | "xLarge" | "xxLarge" | "xxxLarge" | "AX1" | "AX2" | "AX3" | "AX4" | "AX5";

/**
 * Generic phone frame: a 402×874 screen with rounded corners, a small round camera cutout, a status bar and a
 * home indicator. It is an original, neutral shape and does not reproduce any specific device.
 * Sets --dph-frame-safe-top/bottom/start/end (62 / 34 / 0 / 0).
 */
export default function Frame({ children, theme = "light", dir = "ltr", osVersion = "27", statusBarStyle = "auto", bezel = true, time = "9:41", contrast = "standard", textSize = "large" }: FrameProps) {
  return (
    <div className="dph-device" data-ds="diaphane" data-bezel={bezel || undefined} data-theme={theme}>
      <div className="dph-device__screen" data-ds="diaphane" data-theme={theme} data-contrast={contrast === "high" ? "high" : undefined} data-text-size={textSize === "large" ? undefined : textSize} data-os-version={osVersion} dir={dir}>
        <div className="dph-device__content">{children}</div>
        <div className="dph-device__status" data-style={statusBarStyle} aria-hidden="true">
          <span className="dph-device__time">{time}</span>
          <span className="dph-device__glyphs">
            <svg className="dph-device__signal" viewBox="0 0 18 12" width="18" height="12">
              <rect x="0" y="8" width="3" height="4" rx="0.8" />
              <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
              <rect x="10" y="3" width="3" height="9" rx="0.8" />
              <rect x="15" y="0" width="3" height="12" rx="0.8" />
            </svg>
            {/* Wi-Fi glyph: Lucide "wifi" (ISC licence) */}
            <svg className="dph-device__wifi" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h.01" />
              <path d="M2 8.82a15 15 0 0 1 20 0" />
              <path d="M5 12.859a10 10 0 0 1 14 0" />
              <path d="M8.5 16.429a5 5 0 0 1 7 0" />
            </svg>
            <svg className="dph-device__battery" viewBox="0 0 26 12" width="26" height="12">
              <rect className="dph-device__battery-case" x="0.5" y="0.5" width="22" height="11" rx="3" />
              <rect x="2.5" y="2.5" width="18" height="7" rx="1.5" />
              <rect className="dph-device__battery-cap" x="24" y="4" width="1.8" height="4" rx="0.9" />
            </svg>
          </span>
        </div>
        <div className="dph-device__cutout" aria-hidden="true" />
        <div className="dph-device__home" aria-hidden="true" />
      </div>
    </div>
  );
}
