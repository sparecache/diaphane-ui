import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { samples } from "./screens";
import { Gallery } from "./Gallery";
import "../src/styles/tokens.css";
import { installGlassRefraction } from "../src/components/glassRefraction";
import "./playground.css";

// Playground screens import components by path (not the barrel), so install the :active touch listener here too.
document.addEventListener("touchstart", () => {}, { passive: true });
installGlassRefraction();

const params = new URLSearchParams(location.search);
const screenId = params.get("screen");
const theme = (params.get("theme") ?? "light") as "light" | "dark";
const dir = (params.get("dir") ?? "ltr") as "ltr" | "rtl";

function App() {
  return <Gallery initial={screenId ?? samples[0]!.id} theme={theme} dir={dir} />;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
