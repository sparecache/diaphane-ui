import { useState } from "react";
import { Icon, type IconName } from "./Icon";
import "./Avatar.css";

export type AvatarSize = "small" | "medium" | "large";

export type AvatarTone = "auto" | "blue" | "green" | "orange" | "pink" | "purple" | "teal" | "indigo" | "red" | "yellow" | "gray";

/** The tones `tone="auto"` chooses from (the calm, distinguishable ones). */
const AUTO_TONES = ["blue", "green", "orange", "pink", "purple", "teal", "indigo", "red"] as const;

/** Stable tone for a person: the same name always lands on the same color. */
function autoTone(key: string): (typeof AUTO_TONES)[number] {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AUTO_TONES[h % AUTO_TONES.length]!;
}

export interface AvatarProps {
  /** One or two letters shown in the circle ("AH"). Without initials (or `src`) the icon is shown. */
  initials?: string;
  /** Person's full name: the accessible label. Omit when the name is visible next to the avatar. */
  name?: string;
  /** Photo URL; replaces initials and icon. */
  src?: string;
  /** Fallback symbol when there are no initials. */
  icon?: IconName;
  /** small 32 · medium 40 (list rows) · large 60pt. */
  size?: AvatarSize;
  /** Soft tinted background with initials in the strong tone color (like Media fill="soft"). `auto` picks a stable tone
   *  from `name` (or `initials`), so the same person always gets the same color. Omit for the gray Contacts look. */
  tone?: AvatarTone;
  testId?: string;
}

/** Contacts-style circular avatar: gray gradient with white initials (or a soft tone), a photo, or a person symbol. A photo that fails to load falls back to the initials. */
export function Avatar({ initials, name, src, icon = "person.fill", size = "medium", tone, testId }: AvatarProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = !!src && failed !== src;
  const resolved = tone === "auto" ? autoTone(name ?? initials ?? "") : tone;
  const a11y = name ? { role: "img" as const, "aria-label": name } : { "aria-hidden": true as const };
  return (
    <span className="dph-avatar" data-size={size} data-tone={resolved} data-testid={testId} {...a11y}>
      {showImage ? (
        <img className="dph-avatar__image" src={src} alt="" draggable={false} onError={() => setFailed(src!)} />
      ) : initials ? (
        <span className="dph-avatar__initials">{initials}</span>
      ) : (
        <span className="dph-avatar__icon"><Icon name={icon} /></span>
      )}
    </span>
  );
}
