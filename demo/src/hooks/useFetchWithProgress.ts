import { useState, useCallback, useRef } from "react";

interface FetchProgress {
  loaded: number;
  total: number;
  percent: number;
  done: boolean;
  elapsed: number;
  objectUrl: string | null;
}

const INITIAL: FetchProgress = {
  loaded: 0,
  total: 0,
  percent: 0,
  done: false,
  elapsed: 0,
  objectUrl: null,
};

export function useFetchWithProgress() {
  const [progress, setProgress] = useState<FetchProgress>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (url: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setProgress(INITIAL);

    const start = performance.now();
    const cacheBuster = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;

    let response: Response;
    try {
      response = await fetch(cacheBuster, { signal: controller.signal });
    } catch {
      return;
    }

    const total = Number(response.headers.get("content-length")) || 0;
    const reader = response.body?.getReader();
    if (!reader) return;

    const chunks: BlobPart[] = [];
    let loaded = 0;

    while (true) {
      let result: ReadableStreamReadResult<Uint8Array>;
      try {
        result = await reader.read();
      } catch {
        return;
      }
      if (result.done) break;

      chunks.push(result.value as unknown as BlobPart);
      loaded += result.value.length;

      setProgress({
        loaded,
        total,
        percent: total > 0 ? Math.round((loaded / total) * 100) : 0,
        done: false,
        elapsed: Math.round(performance.now() - start),
        objectUrl: null,
      });
    }

    const blob = new Blob(chunks);
    const objectUrl = URL.createObjectURL(blob);

    setProgress({
      loaded,
      total: loaded,
      percent: 100,
      done: true,
      elapsed: Math.round(performance.now() - start),
      objectUrl,
    });

    return objectUrl;
  }, []);

  return { progress, load };
}
