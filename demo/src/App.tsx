import { useRef, useState, type SyntheticEvent } from "react";
import Image from "@son426/vite-image/react";
import heroImage from "./assets/hero.jpg?vite-image";
import CodeSnippet from "./components/CodeSnippet";
import ComparisonTable from "./components/ComparisonTable";
import Features from "./components/Features";
import QuickStart from "./components/QuickStart";
import { useImageMeasurement } from "./hooks/useImageMeasurement";

const RESPONSIVE_SIZES =
  "(max-width: 720px) calc(100vw - 48px), 420px";

export default function App() {
  const [run, setRun] = useState(0);
  const [refMatchesImage, setRefMatchesImage] = useState(false);
  const optimizedRef = useRef<HTMLImageElement>(null);
  const originalRef = useRef<HTMLImageElement>(null);
  const optimized = useImageMeasurement();
  const original = useImageMeasurement();

  const measureOptimized = (event: SyntheticEvent<HTMLImageElement>) => {
    setRefMatchesImage(optimizedRef.current === event.currentTarget);
    void optimized.measure(event.currentTarget);
  };

  const measureOriginal = (event: SyntheticEvent<HTMLImageElement>) => {
    void original.measure(event.currentTarget);
  };

  const handleOptimizedError = (event: SyntheticEvent<HTMLImageElement>) => {
    optimized.fail(event.currentTarget, "image failed to load or decode");
  };

  const handleOriginalError = (event: SyntheticEvent<HTMLImageElement>) => {
    original.fail(event.currentTarget, "image failed to load or decode");
  };

  const reload = () => {
    optimized.reset();
    original.reset();
    setRefMatchesImage(false);
    setRun((current) => current + 1);
  };

  return (
    <main className="page-shell">
      <header className="hero-copy">
        <div className="eyebrow">&gt;_ V1 LIVE DEMO</div>
        <h1>@son426/vite-image</h1>
        <p>
          Build-time responsive image metadata for Vite, rendered with a React
          component that keeps native image semantics.
        </p>
        <p className="measurement-note">
          This page reports the browser-selected URL, intrinsic dimensions, and
          fetched response body size. It does not estimate load time or CLS.
        </p>
      </header>

      <button className="reload-button" type="button" onClick={reload}>
        $ reload --remeasure
      </button>

      <section className="comparison-grid" aria-label="Live image comparison">
        <article className="image-card">
          <div className="card-label card-label--optimized">
            <span className="status-dot status-dot--optimized" />
            vite-image &lt;Image /&gt;
          </div>
          <div className="image-frame">
            <Image
              key={`optimized-${run}`}
              ref={optimizedRef}
              src={heroImage}
              alt="Mountain landscape optimized by vite-image"
              fill
              sizes={RESPONSIVE_SIZES}
              priority
              placeholder="blur"
              style={{ objectFit: "cover" }}
              onLoad={measureOptimized}
              onError={handleOptimizedError}
            />
          </div>
          <div className="card-status" aria-live="polite">
            {optimized.measurement.status === "ready"
              ? "selected response measured"
              : optimized.measurement.status === "error"
                ? `measurement unavailable: ${optimized.measurement.error}`
                : "loading and measuring…"}
          </div>
        </article>

        <article className="image-card">
          <div className="card-label">
            <span className="status-dot" />
            native &lt;img /&gt;, original JPEG
          </div>
          <div className="image-frame">
            <img
              key={`original-${run}`}
              ref={originalRef}
              src="/images/hero-original.jpg"
              alt="The same mountain landscape as the original JPEG"
              loading="eager"
              decoding="async"
              className="native-image"
              onLoad={measureOriginal}
              onError={handleOriginalError}
            />
          </div>
          <div className="card-status" aria-live="polite">
            {original.measurement.status === "ready"
              ? "original response measured"
              : original.measurement.status === "error"
                ? `measurement unavailable: ${original.measurement.error}`
                : "loading and measuring…"}
          </div>
        </article>
      </section>

      <ComparisonTable
        optimized={optimized.measurement}
        original={original.measurement}
        importedWidth={heroImage.width}
        importedHeight={heroImage.height}
        refMatchesImage={refMatchesImage}
        hasBlurDataURL={Boolean(heroImage.blurDataURL)}
      />

      <CodeSnippet />
      <Features />
      <QuickStart />

      <section className="cta">
        <code>pnpm add @son426/vite-image</code>
        <div className="cta-links">
          <a href="https://github.com/son426/vite-image">GitHub source</a>
          <a href="https://www.npmjs.com/package/@son426/vite-image">
            npm package
          </a>
        </div>
      </section>

      <footer>Built from the local v1 workspace package.</footer>
    </main>
  );
}
