import { Suspense, useState } from "react";
import Frame, { type TextSize } from "../frame/phone";
import { screens, samples } from "./screens";
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
  const sampleIds = new Set(samples.map((s) => s.id));
  const specimens = screens.filter((s) => !sampleIds.has(s.id));
  const groups = [...new Set(specimens.map((s) => s.group))];
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
        <div className="pg-seg" role="group" aria-label="Appearance">
          <button aria-pressed={theme === "light"} onClick={() => setTheme("light")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-15.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            Light
          </button>
          <button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            Dark
          </button>
        </div>
        <details className="pg-opts">
          <summary>Options</summary>
          <label className="pg-switch"><span>Right to left</span><input type="checkbox" checked={dir === "rtl"} onChange={(e) => setDir(e.target.checked ? "rtl" : "ltr")} /></label>
          <label className="pg-switch"><span>High contrast</span><input type="checkbox" checked={aa} onChange={(e) => setAA(e.target.checked)} /></label>
          <label className="pg-switch"><span>Pseudo-locale</span><input type="checkbox" checked={pseudo} onChange={(e) => setPseudo(e.target.checked)} /></label>
          <label className="pg-field"><span>Text size</span>
            <select value={dt} onChange={(e) => setDt(e.target.value as TextSize)}>
              {(["xSmall", "small", "medium", "large", "xLarge", "xxLarge", "xxxLarge", "AX1", "AX2", "AX3", "AX4", "AX5"] as const).map((x) => (
                <option key={x} value={x}>{x === "large" ? "Default" : x}</option>
              ))}
            </select>
          </label>
        </details>
        <section>
          <h4>Samples</h4>
          {samples.map((s) => (
            <button key={s.id} className="pg-link" aria-current={s.id === id} onClick={() => select(s.id)}>{s.title}</button>
          ))}
        </section>
        <details open={!sampleIds.has(id)}>
          <summary>Components</summary>
          {groups.map((g) => (
            <section key={g}>
              <h4>{g}</h4>
              {specimens.filter((s) => s.group === g).map((s) => (
                <button key={s.id} className="pg-link" aria-current={s.id === id} onClick={() => select(s.id)}>{s.title}</button>
              ))}
            </section>
          ))}
        </details>
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
