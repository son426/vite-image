import { readdir } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { build, createServer, type ViteDevServer } from "vite";

import { viteImage } from "../../src/plugin";
import type { OptimizedImageData } from "../../src/types";
import {
  createImageFixture,
  type ImageFixture,
  writeFixtureFile,
} from "../helpers/fixture";

interface Candidate {
  url: string;
  width: number;
}

function parseSrcSet(srcSet: string | undefined): Candidate[] {
  if (!srcSet) return [];

  return srcSet.split(",").map((entry) => {
    const match = /^(.+)\s+(\d+)w$/.exec(entry.trim());
    if (!match) throw new TypeError(`invalid srcset candidate: ${entry}`);
    return { url: match[1], width: Number(match[2]) };
  });
}

function serverUrl(server: ViteDevServer): string {
  const address = server.httpServer?.address();
  if (!address || typeof address === "string") {
    throw new TypeError("expected Vite to listen on a TCP port");
  }
  return `http://127.0.0.1:${address.port}`;
}

async function loadImageData(
  server: ViteDevServer,
): Promise<OptimizedImageData> {
  const module = (await server.ssrLoadModule("/src/data.ts")) as {
    default: OptimizedImageData;
  };
  return module.default;
}

async function readCandidate(
  baseUrl: string,
  candidate: Candidate,
): Promise<{ buffer: Buffer; format?: string; width?: number; height?: number }> {
  const response = await fetch(new URL(candidate.url, baseUrl));
  expect(response.status).toBe(200);
  const buffer = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(buffer).metadata();
  return { buffer, ...metadata };
}

describe("actual Vite and vite-imagetools integration", () => {
  let fixture: ImageFixture;
  let server: ViteDevServer;
  let baseUrl: string;
  let imageData: OptimizedImageData;

  beforeAll(async () => {
    fixture = await createImageFixture("vite-image-test-integration-");
    await writeFixtureFile(
      fixture.root,
      "src/data.ts",
      'import image from "./hero.png?vite-image";\nexport default image;\n',
    );
    await writeFixtureFile(
      fixture.root,
      "src/main.ts",
      'import image from "./hero.png?vite-image";\nglobalThis.__IMAGE_DATA__ = image;\n',
    );
    await writeFixtureFile(
      fixture.root,
      "index.html",
      '<!doctype html><html><body><script type="module" src="/src/main.ts"></script></body></html>\n',
    );

    server = await createServer({
      configFile: false,
      root: fixture.root,
      logLevel: "silent",
      plugins: [
        viteImage({
          widths: [2, 4, 8],
          formats: ["avif", "webp"],
          placeholder: { width: 2, quality: 20, blur: 1 },
        }),
      ],
      server: { host: "127.0.0.1", port: 0, strictPort: false },
    });
    await server.listen();
    baseUrl = serverUrl(server);
    imageData = await loadImageData(server);
  });

  afterAll(async () => {
    await server?.close();
    await fixture?.cleanup();
  });

  it("returns intrinsic metadata, ordered sources, and an inline LQIP", () => {
    expect(imageData.width).toBe(6);
    expect(imageData.height).toBe(4);
    expect(imageData.src).toMatch(/^\/@imagetools\/[a-f\d]+$/);
    expect(imageData.sources?.map((source) => source.type)).toEqual([
      "image/avif",
      "image/webp",
    ]);
    expect(imageData.srcSet).toBeTruthy();
    expect(imageData.sources?.every((source) => source.srcSet.length > 0)).toBe(
      true,
    );
    expect(imageData.blurDataURL).toMatch(/^data:image\/webp;base64,/);
  });

  it("serves every generated URL as a valid image without upscaling", async () => {
    const groups = [
      { type: "png", candidates: parseSrcSet(imageData.srcSet) },
      ...(imageData.sources ?? []).map((source) => ({
        type: source.type.slice("image/".length),
        candidates: parseSrcSet(source.srcSet),
      })),
    ];

    for (const group of groups) {
      expect(group.candidates.map((candidate) => candidate.width)).toEqual([
        2, 4, 6,
      ]);
      for (const candidate of group.candidates) {
        const metadata = await readCandidate(baseUrl, candidate);
        expect(metadata.format).toBe(group.type === "avif" ? "heif" : group.type);
        expect(metadata.width).toBe(candidate.width);
        expect(metadata.width).toBeLessThanOrEqual(6);
        expect(metadata.height).toBeLessThanOrEqual(4);
        expect(metadata.buffer.byteLength).toBeGreaterThan(0);
      }
    }

    const fallback = await readCandidate(baseUrl, { url: imageData.src, width: 6 });
    expect(fallback.format).toBe("png");
    expect(fallback.width).toBe(6);
    expect(fallback.height).toBe(4);
  });

  it("builds the exact public import for a client and emits valid image assets", async () => {
    const outputDirectory = join(fixture.root, "dist-client");
    await build({
      configFile: false,
      root: fixture.root,
      logLevel: "silent",
      plugins: [
        viteImage({
          widths: [2, 4, 8],
          formats: ["avif", "webp"],
          placeholder: { width: 2, quality: 20, blur: 1 },
        }),
      ],
      build: {
        outDir: outputDirectory,
        emptyOutDir: true,
        assetsInlineLimit: 0,
      },
    });

    const files = await readdir(outputDirectory, { recursive: true });
    const imageFiles = files.filter((file) =>
      /\.(?:avif|webp|png)$/.test(file),
    );
    expect(imageFiles.some((file) => file.endsWith(".avif"))).toBe(true);
    expect(imageFiles.some((file) => file.endsWith(".webp"))).toBe(true);
    expect(imageFiles.some((file) => file.endsWith(".png"))).toBe(true);

    for (const file of imageFiles) {
      const metadata = await sharp(join(outputDirectory, file)).metadata();
      expect(metadata.width).toBeLessThanOrEqual(6);
      expect(metadata.height).toBeLessThanOrEqual(4);
    }
  });
});

describe("placeholder=false integration", () => {
  let fixture: ImageFixture;
  let server: ViteDevServer;

  beforeAll(async () => {
    fixture = await createImageFixture("vite-image-test-no-placeholder-");
    await writeFixtureFile(
      fixture.root,
      "src/data.ts",
      'import image from "./hero.jpg?vite-image";\nexport default image;\n',
    );
    server = await createServer({
      configFile: false,
      root: fixture.root,
      logLevel: "silent",
      plugins: [
        viteImage({
          widths: [2, 4, 8],
          formats: ["avif", "webp"],
          placeholder: false,
        }),
      ],
      server: { middlewareMode: true },
      appType: "custom",
    });
  });

  afterAll(async () => {
    await server?.close();
    await fixture?.cleanup();
  });

  it("omits blur metadata while preserving optimized image data", async () => {
    const image = await loadImageData(server);
    expect(image).not.toHaveProperty("blurDataURL");
    expect(image.width).toBe(6);
    expect(image.height).toBe(4);
    expect(image.sources?.map((source) => source.type)).toEqual([
      "image/avif",
      "image/webp",
    ]);
  });
});
