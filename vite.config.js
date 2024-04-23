import { resolve } from "path";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import legacy from "@vitejs/plugin-legacy";
import eslint from 'vite-plugin-eslint'
import dts from 'vite-plugin-dts'

export default defineConfig({
  server: {
    // host: "10.1.7.44",
    // port: 8302,
    // open: true,
    // strictPort: true,
    // cors: true,
    // hmr: true,
  },
  build: {
    outDir: "lib",
    target: "es2015",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      fileName: "index",
      formats: ["es", "iife", "umd"],
      name: "ContextMarker",
    },
  },
  plugins: [
    babel(),
    // {
    //   apply: "build",
    //   ...eslint(),
    // },
    dts(),
    // legacy({
    //   targets: ['> 1%', 'not IE 11'],
    // })
  ],
});
