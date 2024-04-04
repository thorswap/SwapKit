import react from "@vitejs/plugin-react";
import nodePolyfills from "rollup-plugin-polyfill-node";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  base: "/SwapKit",

  // NOTE: Have to be added to fix: Uncaught ReferenceError: process & global is not defined
  define: {
    "process.env": {},
    global: "globalThis",
  },
  plugins: [react(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      // events: resolve("./polyfills/events.js"),
      // string_decoder: resolve("./polyfills/string_decoder.js"),

      crypto: "crypto-browserify",
      "node:crypto": "crypto-browserify",
      stream: "stream-browserify",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify/browser",
      path: "path-browserify",
      // _stream_transform: "readable-stream/transform",
      // _stream_readable: "readable-stream/readable",
      // _stream_writable: "readable-stream/writable",
      // _stream_duplex: "readable-stream/duplex",
      // _stream_passthrough: "readable-stream/passthrough",
    },
  },

  build: {
    target: "es2022",
    reportCompressedSize: true,
    sourcemap: true,
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
  },

  esbuild: {
    target: "es2022",
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  optimizeDeps: {
    esbuildOptions: {
      // NOTE: Have to be added to fix: Uncaught ReferenceError: global is not defined
      define: { global: "globalThis" },
    },
  },
});
