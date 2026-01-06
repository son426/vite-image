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
    // types.d.ts는 빌드에서 제외되도록 entry에서 제외
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "vite", "vite-imagetools"],
  // types.d.ts는 빌드에서 제외
  onSuccess: "echo 'Build complete'",
});



