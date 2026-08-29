import { useCallback, useEffect, useRef, useState } from "react";

export interface ImageMeasurement {
  status: "idle" | "measuring" | "ready" | "error";
  url: string | null;
  bytes: number | null;
  naturalWidth: number | null;
  naturalHeight: number | null;
  sourceTypes: string[];
  error: string | null;
}

const INITIAL_MEASUREMENT: ImageMeasurement = {
  status: "idle",
  url: null,
  bytes: null,
  naturalWidth: null,
  naturalHeight: null,
  sourceTypes: [],
  error: null,
};

function renderedSourceTypes(image: HTMLImageElement): string[] {
  const picture = image.parentElement;
  if (picture?.tagName !== "PICTURE") return [];

  return [...picture.querySelectorAll("source")].flatMap((source) => {
    const type = source.getAttribute("type");
    return type ? [type] : [];
  });
}

export function useImageMeasurement() {
  const [measurement, setMeasurement] = useState(INITIAL_MEASUREMENT);
  const controllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setMeasurement(INITIAL_MEASUREMENT);
  }, []);

  const measure = useCallback(async (image: HTMLImageElement) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const url = image.currentSrc || image.src;
    const dimensions = {
      naturalWidth: image.naturalWidth || null,
      naturalHeight: image.naturalHeight || null,
    };
    const sourceTypes = renderedSourceTypes(image);

    setMeasurement({
      status: "measuring",
      url,
      bytes: null,
      ...dimensions,
      sourceTypes,
      error: null,
    });

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const bytes = (await response.blob()).size;
      if (controller.signal.aborted) return;

      setMeasurement({
        status: "ready",
        url,
        bytes,
        ...dimensions,
        sourceTypes,
        error: null,
      });
    } catch (error) {
      if (controller.signal.aborted) return;

      setMeasurement({
        status: "error",
        url,
        bytes: null,
        ...dimensions,
        sourceTypes,
        error: error instanceof Error ? error.message : "Measurement failed",
      });
    }
  }, []);

  const fail = useCallback((image: HTMLImageElement, message: string) => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setMeasurement({
      status: "error",
      url: image.currentSrc || image.src,
      bytes: null,
      naturalWidth: image.naturalWidth || null,
      naturalHeight: image.naturalHeight || null,
      sourceTypes: renderedSourceTypes(image),
      error: message,
    });
  }, []);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    [],
  );

  return { measurement, measure, fail, reset };
}
