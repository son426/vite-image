export default function CodeSnippet() {
  const codeBlockStyle: React.CSSProperties = {
    backgroundColor: "#161b22",
    border: "1px solid #21262d",
    borderRadius: 6,
    padding: 16,
    fontSize: 12,
    lineHeight: 1.7,
    overflow: "auto",
    whiteSpace: "pre",
  };

  return (
    <div style={{ marginTop: 48 }}>
      <div
        style={{
          fontSize: 12,
          color: "#484f58",
          marginBottom: 12,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        // code
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: "#00ff41",
              marginBottom: 8,
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
            vite-image
          </div>
          <pre style={codeBlockStyle}>
            <code>
              <span style={{ color: "#ff7b72" }}>import</span>
              <span style={{ color: "#c9d1d9" }}> Image </span>
              <span style={{ color: "#ff7b72" }}>from</span>
              <span style={{ color: "#a5d6ff" }}>
                {" "}
                "@son426/vite-image/react"
              </span>
              {"\n"}
              <span style={{ color: "#ff7b72" }}>import</span>
              <span style={{ color: "#c9d1d9" }}> hero </span>
              <span style={{ color: "#ff7b72" }}>from</span>
              <span style={{ color: "#a5d6ff" }}>
                {" "}
                "./hero.jpg
                <span style={{ color: "#00ff41", fontWeight: 700 }}>
                  ?vite-image
                </span>
                "
              </span>
              {"\n\n"}
              <span style={{ color: "#7ee787" }}>&lt;Image</span>
              {"\n"}
              <span style={{ color: "#79c0ff" }}>{"  src"}</span>
              <span style={{ color: "#c9d1d9" }}>=</span>
              <span style={{ color: "#c9d1d9" }}>&#123;hero&#125;</span>
              {"\n"}
              <span style={{ color: "#79c0ff" }}>{"  alt"}</span>
              <span style={{ color: "#c9d1d9" }}>=</span>
              <span style={{ color: "#a5d6ff" }}>"Hero"</span>
              {"\n"}
              <span style={{ color: "#79c0ff" }}>{"  placeholder"}</span>
              <span style={{ color: "#c9d1d9" }}>=</span>
              <span style={{ color: "#a5d6ff" }}>"blur"</span>
              {"\n"}
              <span style={{ color: "#7ee787" }}>/&gt;</span>
            </code>
          </pre>
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              color: "#484f58",
              marginBottom: 8,
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
            normal &lt;img&gt;
          </div>
          <pre style={codeBlockStyle}>
            <code>
              <span style={{ color: "#ff7b72" }}>import</span>
              <span style={{ color: "#c9d1d9" }}> hero </span>
              <span style={{ color: "#ff7b72" }}>from</span>
              <span style={{ color: "#a5d6ff" }}> "./hero.jpg"</span>
              {"\n\n\n"}
              <span style={{ color: "#7ee787" }}>&lt;img</span>
              {"\n"}
              <span style={{ color: "#79c0ff" }}>{"  src"}</span>
              <span style={{ color: "#c9d1d9" }}>=</span>
              <span style={{ color: "#c9d1d9" }}>&#123;hero&#125;</span>
              {"\n"}
              <span style={{ color: "#79c0ff" }}>{"  alt"}</span>
              <span style={{ color: "#c9d1d9" }}>=</span>
              <span style={{ color: "#a5d6ff" }}>"Hero"</span>
              {"\n\n"}
              <span style={{ color: "#7ee787" }}>/&gt;</span>
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
