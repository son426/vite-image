interface ProgressBarProps {
  loaded: number;
  total: number;
  percent: number;
  done: boolean;
  elapsed: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProgressBar({
  loaded,
  total,
  percent,
  done,
  elapsed,
}: ProgressBarProps) {
  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          backgroundColor: "#21262d",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            backgroundColor: done ? "#00ff41" : "#00ff41",
            borderRadius: 2,
            transition: "width 0.1s ease-out",
            boxShadow: done
              ? "0 0 8px rgba(0, 255, 65, 0.5)"
              : "0 0 4px rgba(0, 255, 65, 0.3)",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 6,
          fontSize: 11,
          color: "#484f58",
        }}
      >
        <span>
          {formatBytes(loaded)}/{formatBytes(total)}{" "}
          <span style={{ color: done ? "#00ff41" : "#484f58" }}>
            {done ? "DONE" : `${percent}%`}
          </span>
        </span>
        <span style={{ color: done ? "#00ff41" : "#484f58" }}>
          {done ? `${(elapsed / 1000).toFixed(2)}s` : "..."}
        </span>
      </div>
    </div>
  );
}
