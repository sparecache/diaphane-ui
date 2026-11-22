// Menu screens, rendered open.
import { useState } from "react";
import { Button } from "../../src/components/Button";
import { Menu, type MenuItem } from "../../src/components/Menu";
import { ContextMenu } from "../../src/components/ContextMenu";

/** Playground screen: a 180pt gradient tile (radius 24, continuous), 24pt below the safe area, long-pressed. */
export function ContextMenuScreen() {
  const [open, setOpen] = useState(true);
  const items: MenuItem[] = [
    { label: "Copy", icon: "doc.on.doc" },
    { label: "Share", icon: "square.and.arrow.up" },
    { label: "Favorite", icon: "heart" },
    { label: "Hide", icon: "eye.slash" },
    { divider: true },
    { label: "Edit", icon: "slider.horizontal.3" },
    {
      label: "Add to Album",
      icon: "rectangle.stack.badge.plus",
      items: [
        { label: "Favorites", icon: "heart" },
        { label: "Travel", icon: "airplane" },
      ],
    },
    { divider: true },
    { label: "Delete", icon: "trash", role: "destructive" },
  ];
  return (
    <div className="pg-ref" style={{ alignItems: "center", paddingTop: "calc(var(--dph-safe-top) + 24px)" }}>
      <ContextMenu open={open} onOpenChange={setOpen} items={items} layout="small" title="Sunset.jpg" label="Sunset.jpg">
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 24,
            background: "rgb(255 120 60)",
          }}
        />
      </ContextMenu>
    </div>
  );
}

/** Playground screen: bordered "Options" button with a medium palette row, titled sections, checkmarks,
 *  a subtitle, a submenu, a disabled item and a destructive item. */
export function MenuRichScreen() {
  const [open, setOpen] = useState(true);
  return (
    <div className="pg-ref">
      <Menu
        open={open}
        onOpenChange={setOpen}
        label="Options"
        layout="medium"
        trigger={<Button label="Options" variant="bordered" onPress={() => setOpen(true)} />}
        items={[
          { label: "Copy", icon: "doc.on.doc" },
          { label: "Share", icon: "square.and.arrow.up" },
          { label: "Pin", icon: "pin" },
          {
            section: "Sort By",
            items: [
              { label: "Name", checked: true },
              { label: "Date", checked: false },
              { label: "Size", subtitle: "Largest first", checked: false },
            ],
          },
          {
            section: "View",
            items: [
              { label: "Group By", icon: "square.grid.2x2", items: [{ label: "None" }, { label: "Kind" }] },
              { label: "Show Hidden", icon: "eye", disabled: true },
            ],
          },
          { divider: true },
          { label: "Delete", icon: "trash", role: "destructive" },
        ]}
      />
    </div>
  );
}
