import { useState } from "react";

const steps = [
  {
    prompt: "$ npm install",
    code: "npm install @son426/vite-image",
  },
  {
    prompt: "$ cat vite.config.ts",
    code: `import { viteImage } from "@son426/vite-image/plugin"

export default defineConfig({
  plugins: [viteImage()],
})`,
  },
  {
    prompt: "$ cat Hero.tsx",
    code: `import Image from "@son426/vite-image/react"
import hero from "./hero.jpg?vite-image"

<Image src={hero} alt="Hero" placeholder="blur" />`,
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        fontSize: 10,
        fontFamily: "inherit",
        padding: "3px 8px",
        backgroundColor: "transparent",
        color: copied ? "#00ff41" : "#30363d",
        border: `1px solid ${copied ? "#00ff41" : "#21262d"}`,
        borderRadius: 3,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

export default function QuickStart() {
  return (
    <div style={{ marginTop: 48 }}>
      <div
        style={{
          fontSize: 12,
          color: "#484f58",
          marginBottom: 16,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        // quick start
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              border: "1px solid #21262d",
              borderRadius: 6,
              backgroundColor: "#161b22",
              padding: "12px 16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#484f58",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "#00ff41" }}>{i + 1}</span>{" "}
              {step.prompt}
            </div>
            <pre
              style={{
                fontSize: 12,
                lineHeight: 1.7,
                color: "#c9d1d9",
                margin: 0,
                whiteSpace: "pre",
                overflow: "auto",
              }}
            >
              {step.code}
            </pre>
            <CopyButton text={step.code} />
          </div>
        ))}
      </div>
    </div>
  );
}
