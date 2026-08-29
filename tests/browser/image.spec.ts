import { type PreviewServer, build, preview } from "vite";
import { expect, test } from "@playwright/test";
import sharp from "sharp";

import { viteImage } from "../../src/plugin";
import type { OptimizedImageData } from "../../src/types";
import {
  createImageFixture,
  type ImageFixture,
  linkConsumerDependencies,
  writeFixtureFile,
} from "../helpers/fixture";

let fixture: ImageFixture;
let server: PreviewServer;
let applicationUrl: string;

test.beforeAll(async () => {
  fixture = await createImageFixture("vite-image-test-browser-", {
    width: 1920,
    height: 1080,
  });
  await linkConsumerDependencies(fixture.root);
  await writeFixtureFile(
    fixture.root,
    "index.html",
    '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
  );
  await writeFixtureFile(
    fixture.root,
    "src/main.tsx",
    `import { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import Image from "@son426/vite-image/react";
import hero from "./hero.png?vite-image";

window.__IMAGE_DATA__ = hero;

function App() {
  const [refAttached, setRefAttached] = useState(false);
  const imageRef = useCallback((node: HTMLImageElement | null) => {
    setRefAttached(node !== null);
  }, []);

  return (
    <main>
      <output id="ref-state">{refAttached ? "attached" : "detached"}</output>
      <Image
        ref={imageRef}
        src={hero}
        alt="Generated hero"
        sizes="4px"
        placeholder="blur"
        className="hero-image"
        style={{ objectFit: "contain" }}
        wrapperClassName="hero-frame"
        wrapperStyle={{ backgroundColor: "rgb(1, 2, 3)" }}
      />
      <Image
        src={hero}
        alt="Responsive default hero"
        priority
        className="responsive-default-image"
        style={{ width: "100%", height: "auto" }}
        wrapperClassName="responsive-default-frame"
        wrapperStyle={{ display: "block", width: "100%" }}
      />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
`,
  );

  const outputDirectory = `${fixture.root}/dist`;
  await build({
    configFile: false,
    root: fixture.root,
    logLevel: "silent",
    plugins: [
      viteImage({
        widths: [4, 640, 1024, 1920],
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
  server = await preview({
    configFile: false,
    root: fixture.root,
    logLevel: "silent",
    build: { outDir: outputDirectory },
    preview: { host: "127.0.0.1", port: 0, strictPort: false },
  });

  const address = server.httpServer.address();
  if (!address || typeof address === "string") {
    throw new TypeError("expected Vite preview to listen on a TCP port");
  }
  applicationUrl = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await server?.close();
  await fixture?.cleanup();
});

test("loads picture output and preserves DOM semantics through blur lifecycle", async ({
  page,
}) => {
  let releaseImages: () => void = () => undefined;
  const imageGate = new Promise<void>((resolve) => {
    releaseImages = resolve;
  });

  await page.route(/\.(?:avif|webp|png)(?:\?.*)?$/, async (route) => {
    await imageGate;
    await route.continue();
  });
  await page.goto(applicationUrl, { waitUntil: "domcontentloaded" });

  const image = page.getByAltText("Generated hero");
  const overlay = page.locator('img[aria-hidden="true"]');
  const wrapper = page.locator("span.hero-frame");

  try {
    await expect(image).toHaveClass("hero-image");
    await expect(image).toHaveAttribute("sizes", "4px");
    await expect(image).toHaveCSS("object-fit", "contain");
    await expect(wrapper).toHaveCSS("background-color", "rgb(1, 2, 3)");
    await expect(page.locator("#ref-state")).toHaveText("attached");
    await expect(overlay).toHaveCSS("opacity", "1");

    const sourceTypes = await wrapper
      .locator("picture source")
      .evaluateAll((sources) => sources.map((source) => source.getAttribute("type")));
    expect(sourceTypes).toEqual(["image/avif", "image/webp"]);

    const imageData = await page.evaluate(
      () =>
        (window as unknown as Window & { __IMAGE_DATA__: OptimizedImageData })
          .__IMAGE_DATA__,
    );
    expect(imageData.width).toBe(1920);
    expect(imageData.height).toBe(1080);
    expect(imageData.blurDataURL).toMatch(/^data:image\/webp;base64,/);
    expect(imageData.sources?.map((source) => source.type)).toEqual([
      "image/avif",
      "image/webp",
    ]);
  } finally {
    releaseImages();
  }

  await expect
    .poll(() =>
      image.evaluate((element: HTMLImageElement) => ({
        complete: element.complete,
        naturalWidth: element.naturalWidth,
        naturalHeight: element.naturalHeight,
      })),
    )
    .toMatchObject({ complete: true, naturalWidth: 4 });
  const naturalHeight = await image.evaluate(
    (element: HTMLImageElement) => element.naturalHeight,
  );
  expect(naturalHeight).toBeGreaterThan(0);
  expect(naturalHeight).toBeLessThanOrEqual(4);
  await expect(overlay).toHaveCSS("opacity", "0");
});

test("selects a responsive candidate from viewport width and DPR when sizes is omitted", async ({
  browser,
}) => {
  const cases = [
    { viewportWidth: 375, deviceScaleFactor: 1, expectedWidth: 640 },
    { viewportWidth: 375, deviceScaleFactor: 2, expectedWidth: 1024 },
    { viewportWidth: 768, deviceScaleFactor: 1, expectedWidth: 1024 },
    { viewportWidth: 768, deviceScaleFactor: 2, expectedWidth: 1920 },
    { viewportWidth: 1440, deviceScaleFactor: 1, expectedWidth: 1920 },
    { viewportWidth: 1440, deviceScaleFactor: 2, expectedWidth: 1920 },
  ];

  for (const testCase of cases) {
    const context = await browser.newContext({
      viewport: { width: testCase.viewportWidth, height: 900 },
      deviceScaleFactor: testCase.deviceScaleFactor,
    });

    try {
      const page = await context.newPage();
      await page.goto(applicationUrl);
      const image = page.getByAltText("Responsive default hero");
      await image.scrollIntoViewIfNeeded();
      await expect(image).not.toHaveAttribute("sizes");
      await expect(
        page.locator("span.responsive-default-frame source").first(),
      ).not.toHaveAttribute("sizes");
      await expect
        .poll(() =>
          image.evaluate((element: HTMLImageElement) => ({
            complete: element.complete,
            currentSrc: element.currentSrc,
          })),
        )
        .toMatchObject({ complete: true });

      const currentSrc = await image.evaluate(
        (element: HTMLImageElement) => element.currentSrc,
      );
      const response = await fetch(currentSrc);
      expect(response.ok).toBe(true);
      const metadata = await sharp(
        Buffer.from(await response.arrayBuffer()),
      ).metadata();

      expect(metadata.width).toBe(testCase.expectedWidth);
    } finally {
      await context.close();
    }
  }
});
