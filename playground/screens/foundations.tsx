import { useEffect, useRef } from "react";
import { Text, type TextVariant } from "../../src/components/Text";
import { Icon } from "../../src/components/Icon";
import { icons } from "../../src/icons/icons";

const styles: [string, TextVariant][] = [
  ["Large Title", "largeTitle"], ["Title 1", "title1"], ["Title 2", "title2"], ["Title 3", "title3"],
  ["Headline", "headline"], ["Body", "body"], ["Callout", "callout"], ["Subheadline", "subheadline"],
  ["Footnote", "footnote"], ["Caption 1", "caption1"], ["Caption 2", "caption2"],
];

export function TypographyScreen() {
  return (
    <div className="pg-ref">
      {styles.map(([label, v]) => <Text key={v} variant={v}>{label}</Text>)}
      <Text emphasized>Body Emphasized</Text>
      <Text design="rounded">Body Rounded</Text>
      <Text color="secondary">Secondary label</Text>
      <Text color="tertiary">Tertiary label</Text>
      <Text color="quaternary">Quaternary label</Text>
      <Text>The quick brown fox jumps over the lazy dog</Text>
      <Text variant="footnote">The quick brown fox jumps over the lazy dog</Text>
    </div>
  );
}

const SYMBOLS = [
  "checkmark.circle.fill", "xmark.circle.fill", "plus.circle.fill", "minus.circle.fill", "info.circle.fill", "exclamationmark.triangle.fill",
  "square.and.arrow.up", "square.and.pencil", "trash", "folder", "doc.text", "paperplane.fill",
  "heart.fill", "star.fill", "bookmark.fill", "bell.badge.fill", "person.crop.circle.fill", "gearshape.fill",
  "magnifyingglass", "mic.fill", "camera.fill", "photo.on.rectangle", "calendar", "clock",
  "chevron.backward", "chevron.forward", "arrow.up.right", "ellipsis.circle", "line.3.horizontal.decrease", "slider.horizontal.3",
  "wifi", "battery.100percent", "airplane", "location.fill", "lock.fill", "creditcard",
];

/** Icon sampler: glyphs at body size in four weights. */
export function IconsScreen() {
  return (
    <div className="pg-ref" style={{ gap: 14 }}>
      {(["regular", "semibold"] as const).map((w) => (
        <div key={w} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, fontSize: 24, width: "100%" }}>
          {SYMBOLS.map((n) => <span key={n} title={n} style={{ display: "grid", placeItems: "center", height: 36 }}><Icon name={n} weight={w} /></span>)}
        </div>
      ))}
    </div>
  );
}

/** Every built-in icon with its name: the searchable catalog of what `<Icon name="…" />` accepts. */
export function IconCatalogScreen() {
  const names = Object.keys(icons).sort();
  return (
    <div className="pg-ref" style={{ display: "block", padding: "8px 12px 40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px 6px", width: "100%" }}>
        {names.map((n) => (
          <div key={n} title={n} style={{ display: "grid", justifyItems: "center", gap: 4, fontSize: 24, minWidth: 0 }}>
            <Icon name={n} />
            <span style={{ font: "400 9px/11px var(--dph-font-family)", color: "var(--dph-secondary-label)", textAlign: "center", wordBreak: "break-all" }}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
