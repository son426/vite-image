import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteImage } from "@son426/vite-image/plugin";

export default defineConfig({
  plugins: [
    react(),
    ...viteImage({
      widths: [480, 960, 1440],
      formats: ["avif", "webp"],
      quality: 78,
      placeholder: { width: 24, quality: 24, blur: 2 },
    }),
  ],
});
