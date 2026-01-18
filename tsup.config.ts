// tsup.config.ts

import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "react/index": "src/react/index.ts",
    "plugin/index": "src/plugin/index.ts",
  },
  format: ["esm"],
  dts: {
    resolve: true,
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "vite", "vite-imagetools"],
  onSuccess: "echo 'Build complete'",
});


