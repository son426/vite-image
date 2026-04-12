interface ComparisonTableProps {
  optimizedSize: number;
  originalSize: number;
  optimizedElapsed: number;
  originalElapsed: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ComparisonTable({
  optimizedSize,
  originalSize,
  optimizedElapsed,
  originalElapsed,
}: ComparisonTableProps) {
  const reduction =
    originalSize > 0
      ? Math.round((1 - optimizedSize / originalSize) * 100)
      : 0;

  const rows = [
    {
      label: "size",
      optimized: optimizedSize ? formatBytes(optimizedSize) : "-",
      original: originalSize ? formatBytes(originalSize) : "-",
      highlight:
        optimizedSize && originalSize ? `-${reduction}%` : null,
    },
    {
      label: "format",
      optimized: "webp",
      original: "jpeg",
      highlight: null,
    },
    {
      label: "srcSet",
      optimized: "640 / 1024 / 1920w",
      original: "single",
      highlight: null,
    },
    {
      label: "placeholder",
      optimized: "blur lqip",
      original: "none",
      highlight: null,
    },
    {
      label: "time",
      optimized: optimizedElapsed
        ? `${(optimizedElapsed / 1000).toFixed(2)}s`
        : "-",
      original: originalElapsed
        ? `${(originalElapsed / 1000).toFixed(2)}s`
        : "-",
      highlight: null,
    },
  ];

  const cellStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderBottom: "1px solid #21262d",
    fontSize: 12,
    textAlign: "left",
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
        // results
      </div>
      <div
        style={{
          border: "1px solid #21262d",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#161b22" }}>
              <th style={{ ...cellStyle, color: "#484f58", fontWeight: 500 }}>
                $
              </th>
              <th
                style={{
                  ...cellStyle,
                  fontWeight: 600,
                  color: "#00ff41",
                }}
              >
                vite-image
              </th>
              <th
                style={{
                  ...cellStyle,
                  fontWeight: 500,
                  color: "#484f58",
                }}
              >
                &lt;img&gt;
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                style={{
                  backgroundColor: "#0d1117",
                }}
              >
                <td style={{ ...cellStyle, color: "#484f58" }}>
                  {row.label}
                </td>
                <td style={{ ...cellStyle, color: "#c9d1d9" }}>
                  {row.optimized}
                  {row.highlight && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        color: "#00ff41",
                        fontWeight: 600,
                      }}
                    >
                      {row.highlight}
                    </span>
                  )}
                </td>
                <td style={{ ...cellStyle, color: "#484f58" }}>
                  {row.original}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
