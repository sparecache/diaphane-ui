// Glass close-ups for the README: still frames of states that normally exist only under a finger (pressed glass,
// the toggle and slider lens). Open /closeups.html?shot=<id>&theme=light|dark. Without `shot`, every composition is
// stacked for review.
//
// Pressed states: every `:active` rule in the loaded stylesheets is mirrored onto `[data-pg-pressed]`, and elements
// inside a <Pressed> wrapper get that attribute, so the library's own pressed styles render without a pointer.
import { StrictMode, useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "../src/styles/tokens.css";
import "../src/fonts/inter.css";
import { installGlassRefraction } from "../src/components/glassRefraction";
import { Button } from "../src/components/Button";
import { IconButton } from "../src/components/IconButton";
import { Toggle } from "../src/components/Toggle";
import { Slider } from "../src/components/Slider";
import { TabBar } from "../src/components/TabBar";
import { Glass } from "../src/components/Glass";
import { Card } from "../src/components/Card";
import { Chart } from "../src/components/Chart";
import { Text } from "../src/components/Text";
import "./closeups.css";

installGlassRefraction();

function mirrorActiveRules() {
  for (const sheet of [...document.styleSheets]) {
    let rules: CSSRuleList;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of [...rules]) {
      if (rule instanceof CSSStyleRule && rule.selectorText.includes(":active")) {
        const selector = rule.selectorText.replace(/:active/g, "[data-pg-pressed]");
        try { sheet.insertRule(`${selector} { ${rule.style.cssText} }`, sheet.cssRules.length); } catch { /* unsupported selector */ }
      }
    }
  }
}

/** Marks the first button / input inside as pressed. */
function Pressed({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => { ref.current?.querySelector("button, input")?.setAttribute("data-pg-pressed", ""); }, []);
  return <span ref={ref} className="cu-pressed">{children}</span>;
}

function Backdrop({ words = true }: { words?: boolean }) {
  return (
    <div className="cu-bg" aria-hidden="true">
      <span className="cu-bg__blob cu-bg__blob--a" />
      <span className="cu-bg__blob cu-bg__blob--b" />
      <span className="cu-bg__blob cu-bg__blob--c" />
      {words && (
        <div className="cu-bg__words">
          {["Translucent", "Spring-smooth", "Sharp & colourful", "Translucent", "Spring-smooth"].map((w, i) => <span key={i}>{w}</span>)}
        </div>
      )}
    </div>
  );
}

const Label = ({ children }: { children: ReactNode }) => <span className="cu-label">{children}</span>;

const SHOTS: Record<string, { title: string; render: () => ReactNode }> = {
  // Glass over real content: the energy chart card with a floating tab bar and bar buttons.
  "hero-glass": {
    title: "Glass over content",
    render: () => (
      <div className="cu-shot cu-hg">
        <div className="cu-hg__card">
          <Card variant="grouped" title="Active Energy" icon="flame.fill" tint="red">
            <Chart kind="bar" label="Active energy this week" tint="red" highlightIndex={4} height={170} barRadius={6} axes="minimal"
              data={[{ label: "Mon", value: 410 }, { label: "Tue", value: 520 }, { label: "Wed", value: 380 }, { label: "Thu", value: 560 }, { label: "Fri", value: 600 }, { label: "Sat", value: 540 }, { label: "Sun", value: 430 }]} />
          </Card>
        </div>
        <div className="cu-hg__buttons">
          <IconButton variant="glass" icon="square.and.arrow.up" label="Share" />
          <IconButton variant="glassProminent" icon="plus" label="Add" />
        </div>
        <div className="cu-hg__bar">
          <TabBar label="Sections" items={[{ icon: "flame.fill", label: "Today" }, { icon: "chart.bar.xaxis", label: "Trends" }, { icon: "person.crop.circle", label: "You" }]} selected={0} />
        </div>
      </div>
    ),
  },
  buttons: {
    title: "Glass buttons, at rest and pressed",
    render: () => (
      <div className="cu-shot cu-buttons">
        <Backdrop />
        <div className="cu-grid">
          <Label>At rest</Label>
          <Label>Pressed</Label>
          <span><Button variant="glass" label="Follow" /></span>
          <Pressed><Button variant="glass" label="Follow" /></Pressed>
          <span><IconButton variant="glass" size="large" icon="heart" label="Like" /></span>
          <Pressed><IconButton variant="glass" size="large" icon="heart" label="Like" /></Pressed>
          <span><Button variant="glassProminent" label="Get Started" /></span>
          <Pressed><Button variant="glassProminent" label="Get Started" /></Pressed>
        </div>
      </div>
    ),
  },
  toggle: {
    title: "Toggle: the knob becomes a liquid lens while held",
    render: () => (
      <div className="cu-shot cu-zoom">
        <Backdrop words={false} />
        <div className="cu-zoom__inner">
          <div className="cu-row"><Label>On</Label><Toggle label="On" labelHidden checked /></div>
          <div className="cu-row"><Label>Held</Label><Pressed><Toggle label="Held" labelHidden checked /></Pressed></div>
          <div className="cu-row"><Label>Off</Label><Toggle label="Off" labelHidden checked={false} /></div>
        </div>
      </div>
    ),
  },
  slider: {
    title: "Slider: the thumb becomes a lens while dragging",
    render: () => (
      <div className="cu-shot cu-zoom">
        <Backdrop words={false} />
        <div className="cu-zoom__inner cu-zoom__inner--slider">
          <Label>At rest</Label>
          <Slider label="Volume" value={0.35} minIcon="speaker" maxIcon="speaker.wave.3" />
          <Label>Dragging</Label>
          <Pressed><Slider label="Brightness" value={0.62} minIcon="sun.min" maxIcon="sun.max" /></Pressed>
        </div>
      </div>
    ),
  },
  tabbar: {
    title: "Tab bar floating over content",
    render: () => (
      <div className="cu-shot cu-tabbar">
        <div className="cu-tiles" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => <span key={i} className={`cu-tile cu-tile--${i % 6}`}><b>{["Quito", "Kyoto", "Oslo", "Lima", "Cairo", "Seoul"][i % 6]}</b></span>)}
        </div>
        <div className="cu-tabbar__bar">
          <TabBar label="Sections" items={[{ icon: "house", label: "Home" }, { icon: "map", label: "Explore" }, { icon: "bookmark", label: "Saved" }, { icon: "person.circle", label: "Profile" }]} selected={1} searchLabel="Search" searchPlacement="separate" />
        </div>
      </div>
    ),
  },
  refraction: {
    title: "Glass bends what's behind it",
    render: () => (
      <div className="cu-shot cu-refraction">
        <Backdrop />
        <div className="cu-refraction__cards">
          <span className="cu-card"><Card variant="glass"><Text variant="headline">Glass card</Text></Card></span>
          <span className="cu-levels">
            <Glass variant="regular"><Text variant="subheadline">Regular</Text></Glass>
            <Glass variant="clear"><Text variant="subheadline">Clear</Text></Glass>
            <Glass variant="regular" tint="blue"><Text variant="subheadline" color="onAccent">Tinted</Text></Glass>
          </span>
        </div>
      </div>
    ),
  },
  controls: {
    title: "Controls at a glance",
    render: () => (
      <div className="cu-shot cu-controls">
        <Backdrop />
        <div className="cu-controls__bar">
          <IconButton variant="glass" icon="chevron.left" label="Back" />
          <span className="cu-controls__group">
            <IconButton variant="glass" icon="square.and.arrow.up" label="Share" />
            <Pressed><IconButton variant="glassProminent" icon="plus" label="Add" /></Pressed>
          </span>
        </div>
        <div className="cu-controls__panel">
          <Glass variant="regular" shape="rect" cornerRadius={28}>
            <div className="cu-controls__rows">
              <div className="cu-row"><Text>Live Captions</Text><Toggle label="Live Captions" labelHidden checked /></div>
              <div className="cu-row"><Text>Reduce Glare</Text><Pressed><Toggle label="Reduce Glare" labelHidden checked={false} /></Pressed></div>
            </div>
          </Glass>
        </div>
      </div>
    ),
  },
};

function App() {
  const params = new URLSearchParams(location.search);
  const shot = params.get("shot");
  const theme = params.get("theme") === "dark" ? "dark" : "light";
  const [ready, setReady] = useState(false);
  useEffect(() => { mirrorActiveRules(); setReady(true); }, []);
  const ids = shot ? [shot] : Object.keys(SHOTS);
  return (
    <div data-ds="diaphane" data-theme={theme} className="cu-page" data-ready={ready || undefined}>
      {ids.map((id) => SHOTS[id] && (
        <figure key={id} className="cu-figure" id={id}>
          {SHOTS[id]!.render()}
          {!shot && <figcaption>{id}: {SHOTS[id]!.title}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
