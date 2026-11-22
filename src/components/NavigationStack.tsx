import { createContext, useCallback, useContext, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { EXIT_MS } from "./usePresence";
import "./NavigationStack.css";

export interface NavigationApi {
  /** Pushes a page (usually a <Screen>) on top of the stack with a slide-in. */
  push: (page: ReactNode) => void;
  /** Pops the top page with the slide-out. */
  pop: () => void;
  /** Pops back to the root page. */
  popToRoot: () => void;
  /** Pages above the root (0 on the root page). */
  depth: number;
  /** Accessible name of the back button NavigationBar shows on pushed pages. */
  backLabel: string;
}

const NavigationContext = createContext<NavigationApi | null>(null);
/** Per-page flag so a NavigationBar knows whether its page can go back. */
const PageContext = createContext<{ index: number } | null>(null);

/** Navigation of the nearest NavigationStack, or null outside one. */
export function useNavigation(): NavigationApi | null {
  return useContext(NavigationContext);
}
/** True when the calling page sits above the root of its stack (NavigationBar uses it to show the back button). */
export function useCanGoBack(): boolean {
  const page = useContext(PageContext);
  return !!page && page.index > 0;
}

export interface NavigationStackProps {
  /** Root page, usually a <Screen> with a NavigationBar. */
  children: ReactNode;
  /** Accessible name of the automatic back button on pushed pages, e.g. "Back". */
  backLabel: string;
  testId?: string;
}

type PageState = "root" | "entering" | "top" | "covered" | "leaving";
interface Page { id: number; node: ReactNode; state: PageState }

/**
 * NavigationStack: hosts a root page and pushes / pops pages with the push transition (
 * incoming page slides in from the trailing edge, the covered page shifts 30% and dims to 10% black, 0.39s).
 * Swipe from the leading edge to go back. Pushed pages get a back button in their NavigationBar automatically.
 */
export function NavigationStack({ children, backLabel, testId }: NavigationStackProps) {
  const nextId = useRef(1);
  const [pages, setPages] = useState<Page[]>([]);
  const [drag, setDrag] = useState<number | null>(null); // 0…1 progress of an interactive pop
  const root = useRef<HTMLDivElement>(null);

  const push = useCallback((node: ReactNode) => {
    const id = nextId.current++;
    setPages((ps) => [...ps.filter((p) => p.state !== "leaving").map((p) => ({ ...p, state: "covered" as const })), { id, node, state: "entering" }]);
    setTimeout(() => setPages((ps) => ps.map((p) => (p.id === id && p.state === "entering" ? { ...p, state: "top" } : p))), EXIT_MS.push);
  }, []);

  const pop = useCallback(() => {
    setPages((ps) => {
      const live = ps.filter((p) => p.state !== "leaving");
      if (!live.length) return ps;
      const top = live[live.length - 1]!;
      setTimeout(() => setPages((cur) => cur.filter((p) => p.id !== top.id)), EXIT_MS.pop);
      return ps.map((p) => (p.id === top.id ? { ...p, state: "leaving" } : p.id === live[live.length - 2]?.id ? { ...p, state: "top" } : p));
    });
  }, []);

  const popToRoot = useCallback(() => {
    setPages((ps) => {
      const live = ps.filter((p) => p.state !== "leaving");
      if (!live.length) return ps;
      const top = live[live.length - 1]!;
      setTimeout(() => setPages([]), EXIT_MS.pop);
      return ps.filter((p) => p.id === top.id).map((p) => ({ ...p, state: "leaving" as const }));
    });
  }, []);

  const live = pages.filter((p) => p.state !== "leaving");
  const depth = live.length;
  const api = useMemo<NavigationApi>(() => ({ push, pop, popToRoot, depth, backLabel }), [push, pop, popToRoot, depth, backLabel]);

  /** Interactive pop: drag from the leading 32pt edge of the top page. */
  const onPointerDown = (e: ReactPointerEvent) => {
    if (!depth || e.button !== 0 || !root.current) return;
    const box = root.current.getBoundingClientRect();
    const rtl = getComputedStyle(root.current).direction === "rtl";
    const edge = rtl ? box.right - e.clientX : e.clientX - box.left;
    if (edge > 32) return;
    const startX = e.clientX;
    let last = { x: startX, t: performance.now() };
    let v = 0;
    let p = 0;
    const move = (m: PointerEvent) => {
      const dx = (m.clientX - startX) * (rtl ? -1 : 1);
      const now = performance.now();
      v = ((m.clientX - last.x) * (rtl ? -1 : 1)) / Math.max(1, now - last.t);
      last = { x: m.clientX, t: now };
      p = Math.max(0, Math.min(1, dx / box.width));
      setDrag(p);
      m.preventDefault();
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      setDrag(null);
      if (p > 0.35 || v > 0.5) pop();
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const all: Page[] = [{ id: 0, node: children, state: depth ? "covered" : "root" }, ...pages];
  const topId = live[live.length - 1]?.id ?? 0;
  const belowId = live.length >= 2 ? live[live.length - 2]!.id : live.length === 1 ? 0 : -1;

  return (
    <NavigationContext.Provider value={api}>
      <div
        ref={root}
        className="dph-nav"
        data-dragging={drag !== null || undefined}
        style={drag !== null ? { ["--_p" as string]: drag } : undefined}
        onPointerDown={onPointerDown}
        data-testid={testId}
      >
        {all.map((p, index) => {
          const role = p.id === topId ? "top" : p.id === belowId ? "below" : p.state === "leaving" ? "leaving" : "hidden";
          return (
            <div
              key={p.id}
              className="dph-nav__page"
              data-state={p.state}
              data-role={role}
              aria-hidden={role !== "top" || undefined}
              inert={role !== "top" || undefined}
            >
              <PageContext.Provider value={{ index }}>{p.node}</PageContext.Provider>
            </div>
          );
        })}
      </div>
    </NavigationContext.Provider>
  );
}
