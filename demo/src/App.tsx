import { useEffect, useState } from "react";
import Image from "@son426/vite-image/react";
import heroImage from "./assets/hero.jpg?vite-image";
import { useFetchWithProgress } from "./hooks/useFetchWithProgress";
import ProgressBar from "./components/ProgressBar";
import CodeSnippet from "./components/CodeSnippet";
import ComparisonTable from "./components/ComparisonTable";
import Features from "./components/Features";
import QuickStart from "./components/QuickStart";

export default function App() {
  const [key, setKey] = useState(0);
  const [viteImageLoaded, setViteImageLoaded] = useState(false);
  const [viteImageTime, setViteImageTime] = useState(0);
  const [viteImageStart, setViteImageStart] = useState(0);

  const original = useFetchWithProgress();

  useEffect(() => {
    setViteImageStart(performance.now());
  }, [key]);

  const handleReload = () => {
    setKey((k) => k + 1);
    setViteImageLoaded(false);
    setViteImageTime(0);
    original.load("/images/hero-original.jpg");
  };

  useEffect(() => {
    original.load("/images/hero-original.jpg");
  }, []);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "48px 24px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div
          style={{
            fontSize: 11,
            color: "#00ff41",
            marginBottom: 8,
            letterSpacing: 2,
          }}
        >
          &gt;_ DEMO
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#e6edf3",
            marginBottom: 8,
          }}
        >
          @son426/vite-image
        </h1>
        <p style={{ color: "#484f58", fontSize: 13 }}>
          The Next.js &lt;Image /&gt; experience, now in Vite.
          <br />
          Same image, same network — see the difference.
        </p>
      </div>

      {/* Reload */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={handleReload}
          style={{
            padding: "8px 20px",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "inherit",
            backgroundColor: "transparent",
            color: "#00ff41",
            border: "1px solid #00ff41",
            borderRadius: 4,
            cursor: "pointer",
            letterSpacing: 1,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 255, 65, 0.1)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(0, 255, 65, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          $ reload --both
        </button>
      </div>

      {/* Side-by-Side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        {/* vite-image */}
        <div>
          <div
            style={{
              fontSize: 12,
              color: "#00ff41",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#00ff41",
                boxShadow: "0 0 6px rgba(0, 255, 65, 0.5)",
                display: "inline-block",
              }}
            />
            vite-image &lt;Image /&gt;
          </div>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "3 / 2",
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid #21262d",
              backgroundColor: "#161b22",
            }}
          >
            <Image
              key={`vite-${key}`}
              src={heroImage}
              alt="Optimized with vite-image"
              fill
              placeholder="blur"
              onLoad={() => {
                setViteImageLoaded(true);
                setViteImageTime(
                  Math.round(performance.now() - viteImageStart)
                );
              }}
            />
          </div>
          <ProgressBar
            loaded={viteImageLoaded ? 150000 : 0}
            total={150000}
            percent={viteImageLoaded ? 100 : 0}
            done={viteImageLoaded}
            elapsed={viteImageTime}
          />
        </div>

        {/* Normal <img> */}
        <div>
          <div
            style={{
              fontSize: 12,
              color: "#484f58",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#484f58",
                display: "inline-block",
              }}
            />
            normal &lt;img /&gt;
          </div>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "3 / 2",
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid #21262d",
              backgroundColor: "#161b22",
            }}
          >
            {original.progress.objectUrl ? (
              <img
                src={original.progress.objectUrl}
                alt="Original unoptimized"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#21262d",
                  fontSize: 12,
                }}
              >
                {original.progress.percent > 0 ? "loading..." : ""}
              </div>
            )}
          </div>
          <ProgressBar {...original.progress} />
        </div>
      </div>

      {/* Code */}
      <CodeSnippet />

      {/* Table */}
      <ComparisonTable
        optimizedSize={viteImageLoaded ? 150000 : 0}
        originalSize={original.progress.total}
        optimizedElapsed={viteImageTime}
        originalElapsed={original.progress.elapsed}
      />

      {/* Features */}
      <Features />

      {/* Quick Start */}
      <QuickStart />

      {/* CTA */}
      <div
        style={{
          marginTop: 64,
          border: "1px solid #21262d",
          borderRadius: 6,
          backgroundColor: "#161b22",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#484f58",
            marginBottom: 12,
          }}
        >
          $ npm install @son426/vite-image
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#00ff41",
            fontWeight: 700,
            marginBottom: 4,
            textShadow: "0 0 20px rgba(0, 255, 65, 0.3)",
          }}
        >
          npm install @son426/vite-image
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#30363d",
            marginTop: 16,
          }}
        >
          zero config &middot; next.js compatible api &middot; vite native
        </div>
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <a
            href="https://github.com/son426/vite-image"
            style={{
              padding: "8px 20px",
              fontSize: 12,
              fontFamily: "inherit",
              fontWeight: 600,
              backgroundColor: "transparent",
              color: "#c9d1d9",
              border: "1px solid #21262d",
              borderRadius: 4,
              cursor: "pointer",
              letterSpacing: 1,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            github
          </a>
          <a
            href="https://www.npmjs.com/package/@son426/vite-image"
            style={{
              padding: "8px 20px",
              fontSize: 12,
              fontFamily: "inherit",
              fontWeight: 600,
              backgroundColor: "rgba(0, 255, 65, 0.1)",
              color: "#00ff41",
              border: "1px solid rgba(0, 255, 65, 0.3)",
              borderRadius: 4,
              cursor: "pointer",
              letterSpacing: 1,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            npm
          </a>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: "1px solid #161b22",
          textAlign: "center",
          fontSize: 11,
          color: "#21262d",
        }}
      >
        built with @son426/vite-image
      </div>
    </div>
  );
}
