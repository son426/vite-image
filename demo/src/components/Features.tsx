const facts = [
  {
    title: "Explicit imports",
    body: "Only a local static image imported with the exact ?vite-image query enters the build-time pipeline.",
  },
  {
    title: "Ordered picture output",
    body: "Configured AVIF and WebP sources render in order; the input format remains the fallback image.",
  },
  {
    title: "Responsive candidates",
    body: "Configured widths become srcset candidates and stop at the source image's intrinsic width.",
  },
  {
    title: "Native image surface",
    body: "className, style, events, and the forwarded ref belong to the rendered HTMLImageElement.",
  },
  {
    title: "Optional blur overlay",
    body: "Build-time metadata can include an inline WebP LQIP. The overlay fades after load or error.",
  },
  {
    title: "SSR-safe component",
    body: "Rendering does not import React DOM preload APIs. priority sets eager loading and high fetch priority.",
  },
];

export default function Features() {
  return (
    <section className="facts-section">
      <div className="section-label">// verified behavior</div>
      <div className="facts-grid">
        {facts.map((fact) => (
          <article key={fact.title}>
            <h2>{fact.title}</h2>
            <p>{fact.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
