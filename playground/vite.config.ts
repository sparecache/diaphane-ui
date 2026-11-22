import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig({
  // GitHub Pages serves the playground from /<repo>/ (set by the Pages workflow).
  base: process.env.PLAYGROUND_BASE ?? "/",
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react()],
  resolve: { alias: { "diaphane-ui": `${root}src/index.ts` } },
  build: { rollupOptions: { input: { index: fileURLToPath(new URL("index.html", import.meta.url)), closeups: fileURLToPath(new URL("closeups.html", import.meta.url)) } } },
  server: { host: "127.0.0.1", port: 5173, strictPort: true, fs: { allow: [root] } },
});
