const features = [
  { flag: "--fill", desc: "container-filling images" },
  { flag: "--priority", desc: "preload LCP with react-dom" },
  { flag: "--placeholder", desc: "blur | empty | data:image/*" },
  { flag: "--sizes", desc: "auto-calculated from srcSet" },
  { flag: "--decoding", desc: "async | sync | auto" },
  { flag: "--responsive", desc: "640w / 1024w / 1920w srcSet" },
  { flag: "--overrideSrc", desc: "SEO-friendly src override" },
  { flag: "--onLoad", desc: "callback on image load" },
];

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
        }}
      >
        // features
      </div>
      <div
        style={{
          border: "1px solid #21262d",
          borderRadius: 6,
          backgroundColor: "#161b22",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#484f58",
            marginBottom: 12,
          }}
        >
          $ vite-image --help
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px 32px",
          }}
        >
          {features.map((f) => (
            <div
              key={f.flag}
              style={{
                fontSize: 12,
                display: "flex",
                gap: 8,
                lineHeight: 1.8,
              }}
            >
              <span style={{ color: "#00ff41", whiteSpace: "nowrap" }}>
                {f.flag}
              </span>
              <span style={{ color: "#484f58" }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
