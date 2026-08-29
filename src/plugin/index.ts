import type { Plugin, PluginOption } from "vite";
import { imagetools } from "vite-imagetools";

import type { ViteImageConfig } from "../types";

export type {
  OptimizedImageData,
  OptimizedImageSource,
  ViteImageConfig,
} from "../types";

const DEFAULT_WIDTHS = [640, 1024, 1920] as const;
const DEFAULT_FORMATS = ["webp"] as const;
const DEFAULT_QUALITY = 80;
const DEFAULT_PLACEHOLDER = {
  width: 20,
  quality: 20,
  blur: 2,
} as const;

const CONFIG_KEYS = new Set([
  "widths",
  "formats",
  "quality",
  "placeholder",
  "cache",
  "removeMetadata",
]);
const PLACEHOLDER_KEYS = new Set(["width", "quality", "blur"]);
const CACHE_KEYS = new Set(["dir", "retention"]);
const SUPPORTED_FORMATS = new Set(["avif", "webp"]);
const INPUT_FORMATS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

type OutputFormat = "avif" | "webp";
type InputFormat = "jpeg" | "png" | "webp" | "avif";

interface NormalizedConfig {
  widths: readonly number[];
  formats: readonly OutputFormat[];
  quality: number;
  placeholder: false | { width: number; quality: number; blur: number };
  cache: false | { dir?: string; retention?: number } | undefined;
  removeMetadata: boolean;
}

function fail(message: string): never {
  throw new TypeError(`[vite-image] ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rejectUnknownKeys(
  value: Record<string, unknown>,
  allowed: ReadonlySet<string>,
  label: string,
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      fail(`${label} contains unknown key ${JSON.stringify(key)}`);
    }
  }
}

function positiveInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    fail(`${label} must be a positive integer`);
  }

  return value;
}

function boundedQuality(value: unknown, label: string): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 100
  ) {
    fail(`${label} must be an integer between 1 and 100`);
  }

  return value;
}

function normalizeWidths(value: unknown): readonly number[] {
  if (!Array.isArray(value)) {
    fail("widths must be an array of positive integers");
  }
  if (value.length === 0) {
    fail("widths must not be empty");
  }

  const widths = value.map((width, index) =>
    positiveInteger(width, `widths[${index}]`),
  );

  for (let index = 1; index < widths.length; index += 1) {
    if (widths[index] <= widths[index - 1]) {
      fail("widths must be strictly increasing without duplicates");
    }
  }

  return widths;
}

function normalizeFormats(value: unknown): readonly OutputFormat[] {
  if (!Array.isArray(value)) {
    fail("formats must be an array containing avif or webp");
  }
  if (value.length === 0) {
    fail("formats must not be empty");
  }

  const formats = value.map((format, index) => {
    if (typeof format !== "string" || !SUPPORTED_FORMATS.has(format)) {
      fail(`formats[${index}] must be "avif" or "webp"`);
    }
    return format as OutputFormat;
  });

  if (new Set(formats).size !== formats.length) {
    fail("formats must not contain duplicates");
  }

  return formats;
}

function normalizePlaceholder(
  value: unknown,
): NormalizedConfig["placeholder"] {
  if (value === false) return false;
  if (!isRecord(value)) {
    fail("placeholder must be false or an options object");
  }

  rejectUnknownKeys(value, PLACEHOLDER_KEYS, "placeholder");

  const width =
    value.width === undefined
      ? DEFAULT_PLACEHOLDER.width
      : positiveInteger(value.width, "placeholder.width");
  const quality =
    value.quality === undefined
      ? DEFAULT_PLACEHOLDER.quality
      : boundedQuality(value.quality, "placeholder.quality");
  const blur = value.blur === undefined ? DEFAULT_PLACEHOLDER.blur : value.blur;

  if (
    typeof blur !== "number" ||
    !Number.isFinite(blur) ||
    blur < 0.3 ||
    blur > 1000
  ) {
    fail("placeholder.blur must be between 0.3 and 1000");
  }

  return { width, quality, blur };
}

function normalizeCache(value: unknown): NormalizedConfig["cache"] {
  if (value === undefined || value === false) return value;
  if (!isRecord(value)) {
    fail("cache must be false or an options object");
  }

  rejectUnknownKeys(value, CACHE_KEYS, "cache");

  const normalized: { dir?: string; retention?: number } = {};

  if (value.dir !== undefined) {
    if (typeof value.dir !== "string" || value.dir.trim().length === 0) {
      fail("cache.dir must be a non-empty string");
    }
    normalized.dir = value.dir;
  }

  if (value.retention !== undefined) {
    if (
      typeof value.retention !== "number" ||
      !Number.isInteger(value.retention) ||
      value.retention < 0
    ) {
      fail("cache.retention must be a non-negative integer");
    }
    normalized.retention = value.retention;
  }

  return normalized;
}

function normalizeConfig(config: ViteImageConfig | undefined): NormalizedConfig {
  if (config !== undefined && !isRecord(config)) {
    fail("config must be an options object");
  }

  const value: Record<string, unknown> = config ?? {};
  rejectUnknownKeys(value, CONFIG_KEYS, "config");

  if (
    value.removeMetadata !== undefined &&
    typeof value.removeMetadata !== "boolean"
  ) {
    fail("removeMetadata must be a boolean");
  }

  return {
    widths:
      value.widths === undefined
        ? DEFAULT_WIDTHS
        : normalizeWidths(value.widths),
    formats:
      value.formats === undefined
        ? DEFAULT_FORMATS
        : normalizeFormats(value.formats),
    quality:
      value.quality === undefined
        ? DEFAULT_QUALITY
        : boundedQuality(value.quality, "quality"),
    placeholder:
      value.placeholder === undefined
        ? DEFAULT_PLACEHOLDER
        : normalizePlaceholder(value.placeholder),
    cache: normalizeCache(value.cache),
    removeMetadata: value.removeMetadata ?? true,
  };
}

function getInputFormat(basePath: string): InputFormat {
  const match = /\.([^.\\/]+)$/.exec(basePath);
  const extension = match?.[1].toLowerCase();

  if (extension === undefined || !INPUT_FORMATS.has(extension)) {
    const display = extension === undefined ? "<none>" : `.${extension}`;
    fail(
      `unsupported image extension ${JSON.stringify(display)}; expected jpg, jpeg, png, webp, or avif`,
    );
  }

  return extension === "jpg" ? "jpeg" : (extension as InputFormat);
}

function createImportSpecifier(
  basePath: string,
  entries: readonly (readonly [string, string])[],
): string {
  const searchParams = new URLSearchParams(
    entries.map(([key, value]) => [key, value]),
  );
  return `${basePath}?${searchParams.toString()}`;
}

function createModuleCode(
  basePath: string,
  inputFormat: InputFormat,
  config: NormalizedConfig,
): string {
  const transformedFormats = [
    ...config.formats.filter((format) => format !== inputFormat),
    inputFormat,
  ];
  const sourceFormats = transformedFormats.slice(0, -1);
  const pictureSpecifier = createImportSpecifier(basePath, [
    ["w", config.widths.join(";")],
    ["format", transformedFormats.join(";")],
    ["quality", String(config.quality)],
    ["as", "picture"],
  ]);
  const placeholderSpecifier =
    config.placeholder === false
      ? undefined
      : createImportSpecifier(basePath, [
          ["w", String(config.placeholder.width)],
          ["blur", String(config.placeholder.blur)],
          ["quality", String(config.placeholder.quality)],
          ["format", "webp"],
          ["inline", ""],
        ]);

  return [
    `import picture from ${JSON.stringify(pictureSpecifier)};`,
    placeholderSpecifier === undefined
      ? undefined
      : `import blurDataURL from ${JSON.stringify(placeholderSpecifier)};`,
    "",
    `const fallbackFormat = ${JSON.stringify(inputFormat)};`,
    `const sourceFormats = ${JSON.stringify(sourceFormats)};`,
    "const pictureSources = picture.sources ?? {};",
    "const fallbackSrcSet = pictureSources[fallbackFormat];",
    "const sources = sourceFormats.flatMap((format) => {",
    "  const srcSet = pictureSources[format];",
    "  return srcSet ? [{ type: `image/${format}`, srcSet }] : [];",
    "});",
    "const imageData = {",
    "  src: picture.img.src,",
    "  width: picture.img.w,",
    "  height: picture.img.h,",
    "  ...(fallbackSrcSet ? { srcSet: fallbackSrcSet } : {}),",
    "  ...(sources.length > 0 ? { sources } : {}),",
    placeholderSpecifier === undefined
      ? undefined
      : "  ...(blurDataURL ? { blurDataURL } : {}),",
    "};",
    "",
    "export default imageData;",
    "",
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n");
}

function createMacroPlugin(config: NormalizedConfig): Plugin {
  return {
    name: "vite-image:macro",
    enforce: "pre",
    async load(id) {
      const queryIndex = id.indexOf("?");
      if (queryIndex === -1) return null;

      const basePath = id.slice(0, queryIndex);
      const query = id.slice(queryIndex + 1);
      const params = new URLSearchParams(query);

      if (!params.has("vite-image")) return null;
      if (query !== "vite-image") {
        fail("?vite-image must be the only query and must not have a value");
      }

      return createModuleCode(basePath, getInputFormat(basePath), config);
    },
  };
}

/** Creates the exact-query macro and the underlying image transformer. */
export function viteImage(config?: ViteImageConfig): PluginOption[] {
  const normalized = normalizeConfig(config);
  const imagetoolsOptions: Parameters<typeof imagetools>[0] = {
    removeMetadata: normalized.removeMetadata,
    ...(normalized.cache === undefined
      ? {}
      : normalized.cache === false
        ? { cache: { enabled: false } }
        : { cache: { enabled: true, ...normalized.cache } }),
  };

  return [createMacroPlugin(normalized), imagetools(imagetoolsOptions)];
}
