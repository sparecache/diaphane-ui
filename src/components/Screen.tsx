import { createContext, useCallback, useEffect, useRef, useState, type ReactNode, type RefObject, type UIEvent } from "react";
import "./Screen.css";

export type ScreenBackground = "plain" | "grouped";
export type ScreenEdgeEffect = "soft" | "hard";

export interface ScreenProps {
  /** plain = systemBackground (plain lists, content); grouped = systemGroupedBackground (Settings, Form, cards). */
  background?: ScreenBackground;
  /** Page content (List, Form, Card stack…). It scrolls under the header and bottom bar. */
  children: ReactNode;
  /** Floating top bar, e.g. NavigationBar. Screen adds the top safe area above it. */
  header?: ReactNode;
  /** Floating bottom bar, e.g. TabBar or Toolbar. Screen adds the bottom safe area below it. */
  bottomBar?: ReactNode;
  /**
   * Scroll-edge effect under the header. soft = blur that fades out (default);
   * hard = opaque blurred bar with a hairline (drawn under an inline title inside a tab view).
   */
  topEdgeEffect?: ScreenEdgeEffect;
  /** Pull to refresh (.refreshable): called when the user pulls the content down past the threshold and lets go. */
  onRefresh?: () => void;
  /** Shows the refresh spinner above the content until you set it back to false. */
  refreshing?: boolean;
  /** Accessible name of the refresh spinner, e.g. "Refreshing". */
  refreshLabel?: string;
  /** Tinted wash behind the top of the page that scrolls away with the content (summary style). */
  tint?: ScreenTint;
  testId?: string;
}

export type ScreenTint = "accent" | "blue" | "green" | "indigo" | "orange" | "pink" | "purple" | "red" | "teal" | "yellow";

/** Scroll state Screen shares with its bars (TabBar minimizeBehavior="onScrollDown"). */
export interface ScreenScrollState {
  /** True after the content scrolled down; false again once it scrolls up or returns to the top. */
  scrolledDown: boolean;
}
export const ScreenScrollContext = createContext<ScreenScrollState | null>(null);

/* Spinner 30pt, centred in the band above the content. */
const REFRESH_H = 60.333; // content moves down 60.33pt (refresh control 60pt)
const PULL_TRIGGER = 90;
const SPOKES = 8;

/** Pull-down gesture at the top of the scroller (touch, and mouse drag for desktop prototypes). */
function usePull(scroller: RefObject<HTMLDivElement | null>, onRefresh: (() => void) | undefined, refreshing: boolean) {
  const [pull, setPull] = useState(0);
  const pullRef = useRef(0);
  const cb = useRef(onRefresh);
  cb.current = onRefresh;
  const busy = useRef(refreshing);
  busy.current = refreshing;
  const enabled = !!onRefresh;

  useEffect(() => {
    const el = scroller.current;
    if (!el || !enabled) return;
    let startY: number | null = null;
    const update = (v: number) => { pullRef.current = v; setPull(v); };
    const begin = (y: number) => { startY = el.scrollTop <= 0 && !busy.current ? y : null; };
    const move = (y: number, ev: Event) => {
      if (startY === null) return;
      const dy = y - startY;
      if (dy <= 0 || el.scrollTop > 0) { if (pullRef.current) update(0); return; }
      if (ev.cancelable) ev.preventDefault();
      update(dy * 0.5);
    };
    const end = () => {
      if (startY === null) return;
      startY = null;
      if (pullRef.current * 2 >= PULL_TRIGGER) cb.current?.();
      update(0);
    };
    const ts = (e: TouchEvent) => { const t = e.touches[0]; if (t) begin(t.clientY); };
    const tm = (e: TouchEvent) => { const t = e.touches[0]; if (t) move(t.clientY, e); };
    const pd = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      begin(e.clientY);
      const pm = (m: PointerEvent) => move(m.clientY, m);
      const pu = () => { end(); window.removeEventListener("pointermove", pm); window.removeEventListener("pointerup", pu); };
      window.addEventListener("pointermove", pm);
      window.addEventListener("pointerup", pu);
    };
    el.addEventListener("touchstart", ts, { passive: true });
    el.addEventListener("touchmove", tm, { passive: false });
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
    el.addEventListener("pointerdown", pd);
    return () => {
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchmove", tm);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
      el.removeEventListener("pointerdown", pd);
    };
  }, [scroller, enabled]);
  return pull;
}

/**
 * Page scaffold. Fills its frame, owns scrolling and safe areas (--dph-safe-*), floats the header and
 * bottom bar over the content with the scroll-edge effect, and hosts pull to refresh.
 */
export function Screen({ background = "plain", children, header, bottomBar, topEdgeEffect = "soft", onRefresh, refreshing = false, refreshLabel, tint, testId }: ScreenProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [scrolledDown, setScrolledDown] = useState(false);
  const last = useRef(0);
  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    const d = top - last.current;
    if (top <= 0) setScrolledDown(false);
    else if (d > 4) setScrolledDown(true);
    else if (d < -4) setScrolledDown(false);
    if (Math.abs(d) > 4 || top <= 0) last.current = top;
  }, []);
  // Scroll indicator: 3pt capsule, 3pt from the trailing edge, inset past the bars, visible while scrolling.
  const indicator = useRef<HTMLSpanElement>(null);
  const fade = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touching = useRef(false);
  const scheduleFade = useCallback(() => {
    clearTimeout(fade.current);
    if (touching.current) return; // the indicator stays up while a finger is on the content
    fade.current = setTimeout(() => { if (indicator.current) delete indicator.current.dataset.visible; }, 650);
  }, []);
  const updateIndicator = useCallback(() => {
    const sc = scroller.current, ind = indicator.current;
    if (!sc || !ind) return;
    const max = sc.scrollHeight - sc.clientHeight;
    if (max <= 1) { delete ind.dataset.visible; return; }
    const head = sc.querySelector<HTMLElement>(":scope > .dph-screen__header");
    const foot = sc.querySelector<HTMLElement>(":scope > .dph-screen__bottom");
    const content = sc.querySelector<HTMLElement>(":scope > .dph-screen__content");
    const cs = content ? getComputedStyle(content) : null;
    const top = (head ? head.offsetHeight : parseFloat(cs?.paddingTop ?? "0")) + 3;
    const bottom = (foot ? foot.offsetHeight : parseFloat(cs?.paddingBottom ?? "0")) + 3;
    const track = sc.clientHeight - top - bottom;
    let len = Math.max(36, track * (sc.clientHeight / sc.scrollHeight));
    const st = sc.scrollTop;
    const over = st < 0 ? -st : st > max ? st - max : 0; // rubber-band: the capsule shrinks
    len = Math.max(7, len - over);
    const p = Math.min(1, Math.max(0, st / max));
    ind.style.height = `${len}px`;
    ind.style.transform = `translateY(${top + (track - len) * p}px)`;
    ind.dataset.visible = "";
    scheduleFade();
  }, [scheduleFade]);
  useEffect(() => () => clearTimeout(fade.current), []);
  const pull = usePull(scroller, onRefresh, refreshing);
  const showRefresh = !!onRefresh || refreshing;
  const height = refreshing ? Math.max(REFRESH_H, pull) : pull;
  const spokes = refreshing ? SPOKES : Math.min(SPOKES, Math.floor((pull * 2 / PULL_TRIGGER) * SPOKES));

  return (
    <ScreenScrollContext.Provider value={{ scrolledDown }}>
      <div className="dph-screen" data-background={background} data-top-edge={topEdgeEffect} data-tint={tint} data-testid={testId}>
        <div
          className="dph-screen__scroll"
          ref={scroller}
          onScroll={(e) => { onScroll(e); updateIndicator(); }}
          onPointerDown={() => { touching.current = true; clearTimeout(fade.current); }}
          onPointerUp={() => { touching.current = false; scheduleFade(); }}
          onPointerCancel={() => { touching.current = false; scheduleFade(); }}
          onTouchEnd={() => { touching.current = false; scheduleFade(); }}
        >
          {header && <header className="dph-screen__header">{header}</header>}
          <main className="dph-screen__content" data-has-header={header ? "" : undefined} data-has-bottom={bottomBar ? "" : undefined}>
            {showRefresh && (
              <div className="dph-screen__refresh" data-pulling={pull > 0 || undefined} style={{ ["--_h" as string]: `${height}px` }}>
                {(refreshing || pull > 0) && (
                  <span
                    className="dph-screen__spinner"
                    data-spinning={refreshing || undefined}
                    role={refreshing ? "progressbar" : undefined}
                    aria-label={refreshing ? refreshLabel : undefined}
                    aria-hidden={refreshing ? undefined : true}
                  >
                    {Array.from({ length: spokes }, (_, i) => (
                      <span key={i} className="dph-screen__spoke" style={{ ["--i" as string]: i }} />
                    ))}
                  </span>
                )}
              </div>
            )}
            {children}
          </main>
          {bottomBar && <footer className="dph-screen__bottom">{bottomBar}</footer>}
        </div>
        <span className="dph-screen__indicator" ref={indicator} aria-hidden="true" />
      </div>
    </ScreenScrollContext.Provider>
  );
}
