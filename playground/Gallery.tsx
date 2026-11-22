import { Suspense, useState } from "react";
import Frame, { type TextSize } from "../frame/phone";
import { screens } from "./screens";
import { PseudoLocale } from "./pseudo";

/** Desktop viewer: every screen inside the phone frame, with theme / direction / pseudo-locale toggles. */
export function Gallery({ initial, theme: initialTheme, dir: initialDir }: { initial: string; theme: "light" | "dark"; dir: "ltr" | "rtl" }) {
  const [id, setId] = useState(initial);
  const [theme, setTheme] = useState(initialTheme);
  const [dir, setDir] = useState(initialDir);
  const [pseudo, setPseudo] = useState(false);
  const [aa, setAA] = useState(false);
  const [dt, setDt] = useState<TextSize>("large");
  const entry = screens.find((s) => s.id === id) ?? screens[0]!;
  const groups = [...new Set(screens.map((s) => s.group))];
  const select = (next: string) => {
    setId(next);
    const u = new URL(location.href);
    u.searchParams.set("screen", next);
    history.replaceState(null, "", u);
  };
  if (new URLSearchParams(location.search).has("bare")) {
    // ?bare=1 renders just the framed screen (used for documentation screenshots).
    return (
      <main className="pg-stage" style={{ minHeight: "auto" }}>
        {/* Screenshots use the bundled open font so no platform font appears in published images. */}
        <style>{`[data-ds="diaphane"] { --dph-font-family: "Inter Variable", Inter, sans-serif; --dph-font-family-rounded: "Inter Variable", Inter, sans-serif; } [data-ds="diaphane"] *, [data-ds="diaphane"] *::before, [data-ds="diaphane"] *::after { animation: none !important; }`}</style>
        <Frame theme={initialTheme} dir={initialDir}>
          <Suspense fallback={null}><entry.Component key={entry.id} /></Suspense>
        </Frame>
      </main>
    );
  }
  return (
    <div className="pg-gallery">
      <nav className="pg-nav">
        <div className="pg-toggles">
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "☀︎ Light" : "☾ Dark"}</button>
          <button onClick={() => setDir(dir === "ltr" ? "rtl" : "ltr")}>{dir.toUpperCase()}</button>
          <button aria-pressed={pseudo} onClick={() => setPseudo(!pseudo)}>Pseudo</button>
          <button aria-pressed={aa} onClick={() => setAA(!aa)} title="High contrast (WCAG AA)">AA</button>
        </div>
        <select className="pg-select" value={dt} onChange={(e) => setDt(e.target.value as TextSize)} aria-label="Text size">
          {(["xSmall", "small", "medium", "large", "xLarge", "xxLarge", "xxxLarge", "AX1", "AX2", "AX3", "AX4", "AX5"] as const).map((s) => (
            <option key={s} value={s}>{s === "large" ? "Text size: Large (default)" : `Text size: ${s}`}</option>
          ))}
        </select>
        {groups.map((g) => (
          <section key={g}>
            <h4>{g}</h4>
            {screens.filter((s) => s.group === g).map((s) => (
              <button key={s.id} className="pg-link" aria-current={s.id === id} onClick={() => select(s.id)}>{s.title}</button>
            ))}
          </section>
        ))}
      </nav>
      <main className="pg-stage">
        <Frame theme={theme} dir={dir} contrast={aa ? "high" : "standard"} textSize={dt}>
          <PseudoLocale enabled={pseudo}>
            <Suspense fallback={null}><entry.Component key={entry.id} /></Suspense>
          </PseudoLocale>
        </Frame>
      </main>
    </div>
  );
}
