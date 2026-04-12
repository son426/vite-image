import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteImage } from "@son426/vite-image/plugin";

export default defineConfig({
  plugins: [react(), viteImage()],
});
