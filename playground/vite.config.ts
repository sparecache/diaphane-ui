import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

// The deployed playground is static and loads nothing from other origins, so say so in the page itself.
// (Build only: the dev server needs inline scripts for hot reload.)
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'";
const contentSecurityPolicy = {
  name: "playground-csp",
  apply: "build" as const,
  transformIndexHtml: () => [{ tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: csp }, injectTo: "head-prepend" as const }],
};

export default defineConfig({
  // GitHub Pages serves the playground from /<repo>/ (set by the Pages workflow).
  base: process.env.PLAYGROUND_BASE ?? "/",
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react(), contentSecurityPolicy],
  resolve: { alias: { "diaphane-ui": `${root}src/index.ts` } },
  build: { rollupOptions: { input: { index: fileURLToPath(new URL("index.html", import.meta.url)), closeups: fileURLToPath(new URL("closeups.html", import.meta.url)) } } },
  server: { host: "127.0.0.1", port: 5173, strictPort: true, fs: { allow: [root] } },
});
