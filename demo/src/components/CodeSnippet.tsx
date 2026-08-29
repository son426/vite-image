const configCode = `import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteImage } from "@son426/vite-image/plugin"

export default defineConfig({
  plugins: [
    react(),
    ...viteImage({
      widths: [480, 960, 1440],
      formats: ["avif", "webp"],
    }),
  ],
})`;

const componentCode = `import Image from "@son426/vite-image/react"
import hero from "./hero.jpg?vite-image"

<div className="hero-frame">
  <Image
    ref={imageRef}
    src={hero}
    alt="Mountain landscape"
    fill
    sizes="(max-width: 720px) calc(100vw - 48px), 420px"
    placeholder="blur"
    style={{ objectFit: "cover" }}
  />
</div>`;

export default function CodeSnippet() {
  return (
    <section className="code-section">
      <div className="section-label">// code running above</div>
      <div className="code-grid">
        <div>
          <div className="code-title">vite.config.ts</div>
          <pre>
            <code>{configCode}</code>
          </pre>
        </div>
        <div>
          <div className="code-title">Hero.tsx</div>
          <pre>
            <code>{componentCode}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
