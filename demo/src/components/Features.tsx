export default function Features() {
  return (
    <div style={{ marginTop: 48 }}>
      <div
        style={{
          fontSize: 12,
          color: "#484f58",
          marginBottom: 16,
          letterSpacing: 1,
          textTransform: "uppercase",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>// props</span>
        <a
          href="https://nextjs.org/docs/app/api-reference/components/image"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 11,
            color: "#30363d",
            textDecoration: "none",
            textTransform: "none",
            letterSpacing: 0,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#484f58";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#30363d";
          }}
        >
          next/image compatible API →
        </a>
      </div>
      <div
        style={{
          border: "1px solid #21262d",
          borderRadius: 6,
          backgroundColor: "#161b22",
          padding: "20px 24px",
        }}
      >
        <pre
          style={{
            fontSize: 12,
            lineHeight: 2,
            margin: 0,
            overflow: "auto",
          }}
        >
          <code>
            <span style={{ color: "#7ee787" }}>&lt;Image</span>
            {"\n"}
            <Prop name="src" value="{hero}" comment="// ?vite-image import object" />
            <Prop name="fill" value="" comment="// container-filling mode" />
            <Prop name="priority" value="" comment="// preload LCP via react-dom" />
            <Prop name="loading" value='"lazy"' comment='// "lazy" | "eager"' />
            <Prop name="placeholder" value='"blur"' comment="// blur | empty | data:image/*" />
            <Prop name="blurDataURL" value='"data:image/..."' comment="// custom blur (overrides auto)" />
            <Prop name="sizes" value='"(max-width: 768px) 100vw, 50vw"' comment="// auto if omitted" />
            <Prop name="decoding" value='"async"' comment="// async | sync | auto" />
            <Prop name="overrideSrc" value='"/og-image.jpg"' comment="// SEO src override" />
            <Prop name="onLoad" value="{(e) => console.log(e)}" comment="// load callback" />
            <Prop name="onError" value="{(e) => console.error(e)}" comment="// error callback" />
            <span style={{ color: "#7ee787" }}>/&gt;</span>
          </code>
        </pre>
      </div>
    </div>
  );
}

function Prop({
  name,
  value,
  comment,
}: {
  name: string;
  value: string;
  comment: string;
}) {
  return (
    <>
      {"  "}
      <span style={{ color: "#79c0ff" }}>{name}</span>
      {value && (
        <>
          <span style={{ color: "#c9d1d9" }}>=</span>
          <span style={{ color: "#a5d6ff" }}>{value}</span>
        </>
      )}
      {"  "}
      <span style={{ color: "#30363d" }}>{comment}</span>
      {"\n"}
    </>
  );
}
