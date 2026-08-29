const configCode = `import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteImage } from "@son426/vite-image/plugin"

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
})`;

const componentCode = `import { useRef } from "react"
import Image from "@son426/vite-image/react"
import heroImage from "./assets/hero.jpg?vite-image"

export function Hero() {
  const imageRef = useRef<HTMLImageElement>(null)

  return (
    <div className="image-frame">
      <Image
        ref={imageRef}
        src={heroImage}
        alt="Mountain landscape optimized by vite-image"
        fill
        sizes="(max-width: 720px) calc(100vw - 48px), 420px"
        priority
        placeholder="blur"
        style={{ objectFit: "cover" }}
      />
    </div>
  )
}`;

export default function CodeSnippet() {
  return (
    <section className="code-section">
      <div className="section-label">// configuration and image props running above</div>
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
