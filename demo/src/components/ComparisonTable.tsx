import type { ImageMeasurement } from "../hooks/useImageMeasurement";

interface ComparisonTableProps {
  optimized: ImageMeasurement;
  original: ImageMeasurement;
  importedWidth: number;
  importedHeight: number;
  refMatchesImage: boolean;
  hasBlurDataURL: boolean;
}

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "–";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

function formatDimensions(measurement: ImageMeasurement): string {
  if (
    measurement.naturalWidth === null ||
    measurement.naturalHeight === null
  ) {
    return "–";
  }
  return `${measurement.naturalWidth} × ${measurement.naturalHeight}`;
}

function selectedAsset(url: string | null): string {
  if (!url) return "–";

  try {
    const parsed = new URL(url, window.location.href);
    return parsed.pathname.split("/").at(-1) || parsed.pathname;
  } catch {
    return url;
  }
}

export default function ComparisonTable({
  optimized,
  original,
  importedWidth,
  importedHeight,
  refMatchesImage,
  hasBlurDataURL,
}: ComparisonTableProps) {
  const reduction =
    optimized.bytes !== null &&
    original.bytes !== null &&
    original.bytes > 0
      ? Math.round((1 - optimized.bytes / original.bytes) * 100)
      : null;

  const rows = [
    {
      label: "follow-up response Blob",
      optimized: formatBytes(optimized.bytes),
      original: formatBytes(original.bytes),
      detail:
        reduction === null
          ? null
          : `${Math.abs(reduction)}% ${reduction >= 0 ? "smaller" : "larger"}`,
    },
    {
      label: "browser-selected asset",
      optimized: selectedAsset(optimized.url),
      original: selectedAsset(original.url),
      detail: null,
    },
    {
      label: "natural dimensions",
      optimized: formatDimensions(optimized),
      original: formatDimensions(original),
      detail: null,
    },
    {
      label: "rendered <source> types",
      optimized:
        optimized.sourceTypes.length > 0
          ? optimized.sourceTypes.join(" → ")
          : "–",
      original: "none",
      detail: null,
    },
    {
      label: "imported fallback metadata",
      optimized: `${importedWidth} × ${importedHeight}`,
      original: "not generated",
      detail: null,
    },
    {
      label: "forwarded ref target",
      optimized: refMatchesImage ? "HTMLImageElement" : "–",
      original: "native HTMLImageElement",
      detail: null,
    },
    {
      label: "inline blur metadata",
      optimized: hasBlurDataURL ? "present" : "absent",
      original: "none",
      detail: null,
    },
  ];

  return (
    <section className="results-section">
      <div className="section-label">// observed results</div>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">
            Browser-selected image metadata and follow-up fetch response Blob
            sizes
          </caption>
          <thead>
            <tr>
              <th scope="col">observation</th>
              <th scope="col">vite-image</th>
              <th scope="col">original</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>
                  <code>{row.optimized}</code>
                  {row.detail ? (
                    <span className="result-detail">{row.detail}</span>
                  ) : null}
                </td>
                <td>
                  <code>{row.original}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="measurement-method">
        After each image fires <code>load</code>, the demo makes a separate{" "}
        <code>fetch(currentSrc)</code> request and reads{" "}
        <code>response.blob().size</code>. The browser may serve that request from
        cache. The value is the response body size after HTTP content decoding,
        not bytes transferred over the wire. A dash means the follow-up
        measurement failed.
      </p>
    </section>
  );
}
