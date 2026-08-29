import { useEffect, useRef, useState } from "react";

const steps = [
  {
    label: "Install",
    code: "pnpm add @son426/vite-image",
  },
  {
    label: "src/vite-env.d.ts",
    code: `/// <reference types="vite/client" />
/// <reference types="@son426/vite-image/client" />`,
  },
  {
    label: "vite.config.ts",
    code: `import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteImage } from "@son426/vite-image/plugin"

export default defineConfig({
  plugins: [react(), ...viteImage()],
})`,
  },
  {
    label: "Hero.tsx",
    code: `import Image from "@son426/vite-image/react"
import hero from "./hero.jpg?vite-image"

export function Hero() {
  return <Image src={hero} alt="Mountain landscape" placeholder="blur" />
}`,
  },
];

function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const handleCopy = async () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);

    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }

    timerRef.current = window.setTimeout(() => setState("idle"), 1500);
  };

  return (
    <button className="copy-button" type="button" onClick={handleCopy}>
      {state === "copied" ? "copied" : state === "failed" ? "failed" : "copy"}
    </button>
  );
}

export default function QuickStart() {
  return (
    <section className="quick-start">
      <div className="section-label">// quick start</div>
      <div className="steps">
        {steps.map((step, index) => (
          <article className="step" key={step.label}>
            <div className="step-heading">
              <span>{index + 1}</span> {step.label}
            </div>
            <pre>
              <code>{step.code}</code>
            </pre>
            <CopyButton text={step.code} />
          </article>
        ))}
      </div>
    </section>
  );
}
