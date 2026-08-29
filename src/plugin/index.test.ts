import type { Plugin } from "vite";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { imagetoolsMock } = vi.hoisted(() => ({
  imagetoolsMock: vi.fn(() => ({ name: "imagetools-stub" })),
}));

vi.mock("vite-imagetools", () => ({
  imagetools: imagetoolsMock,
}));

import { viteImage } from "./index";

type MacroLoad = (id: string) => null | string | Promise<null | string>;

function getMacroLoad(config?: Parameters<typeof viteImage>[0]): MacroLoad {
  const [plugin] = viteImage(config);
  const load = (plugin as Plugin).load;

  if (typeof load !== "function") {
    throw new TypeError("expected the macro to use a Vite 7 compatible load hook");
  }

  return load as MacroLoad;
}

function evaluateGeneratedModule(
  code: string,
  picture: unknown,
  blurDataURL?: string,
): unknown {
  const executable = code
    .replace(/^import picture from .+;$/m, `const picture = ${JSON.stringify(picture)};`)
    .replace(
      /^import blurDataURL from .+;$/m,
      `const blurDataURL = ${JSON.stringify(blurDataURL)};`,
    )
    .replace("export default imageData;", "return imageData;");

  // The generated module body is controlled by this package; file-system input is
  // kept inside JSON string literals and never evaluated as code.
  return Function(executable)();
}

describe("viteImage config validation", () => {
  beforeEach(() => {
    imagetoolsMock.mockClear();
  });

  it.each([
    [{ widths: [] }, "widths must not be empty"],
    [{ widths: [640, 640] }, "widths must be strictly increasing"],
    [{ widths: [1024, 640] }, "widths must be strictly increasing"],
    [{ widths: [640.5] }, "widths[0] must be a positive integer"],
    [{ formats: [] }, "formats must not be empty"],
    [{ formats: ["webp", "webp"] }, "formats must not contain duplicates"],
    [{ formats: ["jpeg"] }, 'formats[0] must be "avif" or "webp"'],
    [{ quality: 0 }, "quality must be an integer between 1 and 100"],
    [{ quality: 100.5 }, "quality must be an integer between 1 and 100"],
    [{ placeholder: { width: 0 } }, "placeholder.width must be a positive integer"],
    [{ placeholder: { quality: 101 } }, "placeholder.quality must be an integer between 1 and 100"],
    [{ placeholder: { blur: 0.2 } }, "placeholder.blur must be between 0.3 and 1000"],
    [{ placeholder: { extra: true } }, 'placeholder contains unknown key "extra"'],
    [{ cache: { dir: " " } }, "cache.dir must be a non-empty string"],
    [{ cache: { retention: -1 } }, "cache.retention must be a non-negative integer"],
    [{ cache: { extra: true } }, 'cache contains unknown key "extra"'],
    [{ removeMetadata: "yes" }, "removeMetadata must be a boolean"],
    [{ unknown: true }, 'config contains unknown key "unknown"'],
  ] as const)("rejects invalid config %#", (config, message) => {
    expect(() => viteImage(config as never)).toThrow(`[vite-image] ${message}`);
  });

  it("maps only the supported cache and metadata options to imagetools", () => {
    viteImage({
      cache: { dir: ".cache/images", retention: 3600 },
      removeMetadata: false,
    });

    expect(imagetoolsMock).toHaveBeenLastCalledWith({
      cache: { enabled: true, dir: ".cache/images", retention: 3600 },
      removeMetadata: false,
    });

    viteImage({ cache: false });
    expect(imagetoolsMock).toHaveBeenLastCalledWith({
      cache: { enabled: false },
      removeMetadata: true,
    });
  });
});

describe("viteImage macro", () => {
  beforeEach(() => {
    imagetoolsMock.mockClear();
  });

  it("only handles the exact valueless ?vite-image query", async () => {
    const load = getMacroLoad();

    await expect(load("/images/hero.jpg")).resolves.toBeNull();
    await expect(load("/images/hero.jpg?width=640")).resolves.toBeNull();
    await expect(load("/images/hero.jpg?vite-image")).resolves.toContain(
      "export default imageData;",
    );
  });

  it.each([
    "/images/hero.jpg?vite-image=",
    "/images/hero.jpg?vite-image=true",
    "/images/hero.jpg?vite-image&quality=60",
    "/images/hero.jpg?quality=60&vite-image",
    "/images/hero.jpg?vite-image&vite-image",
  ])("rejects a mixed or valued public query: %s", async (id) => {
    await expect(getMacroLoad()(id)).rejects.toThrow(
      "[vite-image] ?vite-image must be the only query and must not have a value",
    );
  });

  it.each(["gif", "svg", "bmp", "txt"])(
    "rejects unsupported .%s input",
    async (extension) => {
      await expect(
        getMacroLoad()(`/images/hero.${extension}?vite-image`),
      ).rejects.toThrow(
        `[vite-image] unsupported image extension ".${extension}"; expected jpg, jpeg, png, webp, or avif`,
      );
    },
  );

  it("builds picture directives with ordered formats and the original fallback last", async () => {
    const code = await getMacroLoad({
      widths: [320, 640],
      formats: ["webp", "avif"],
      quality: 75,
      placeholder: false,
    })("/images/hero.jpg?vite-image");

    expect(code).toContain(
      'import picture from "/images/hero.jpg?w=320%3B640&format=webp%3Bavif%3Bjpeg&quality=75&as=picture";',
    );
    expect(code).not.toContain("blurDataURL from");
  });

  it("moves the fallback srcset and preserves source priority", async () => {
    const code = await getMacroLoad({ placeholder: false })(
      "/images/hero.png?vite-image",
    );

    if (code === null) throw new TypeError("expected generated module code");

    expect(
      evaluateGeneratedModule(code, {
        sources: {
          webp: "/hero-640.webp 640w, /hero-1024.webp 1024w",
          png: "/hero-640.png 640w, /hero-1024.png 1024w",
        },
        img: { src: "/hero-1024.png", w: 1024, h: 683 },
      }),
    ).toEqual({
      src: "/hero-1024.png",
      width: 1024,
      height: 683,
      srcSet: "/hero-640.png 640w, /hero-1024.png 1024w",
      sources: [
        {
          type: "image/webp",
          srcSet: "/hero-640.webp 640w, /hero-1024.webp 1024w",
        },
      ],
    });
  });

  it("deduplicates an original configured format and keeps it as fallback", async () => {
    const code = await getMacroLoad({
      formats: ["webp", "avif"],
      placeholder: false,
    })("/images/hero.webp?vite-image");

    expect(code).toContain("format=avif%3Bwebp");
    expect(code).not.toContain("format=webp%3Bavif%3Bwebp");
  });

  it("emits a default inline WebP placeholder directive", async () => {
    const code = await getMacroLoad()("/images/hero.jpeg?vite-image");

    expect(code).toContain(
      'import blurDataURL from "/images/hero.jpeg?w=20&blur=2&quality=20&format=webp&inline=";',
    );
  });

  it("escapes generated import specifiers as JavaScript strings", async () => {
    const path = '/images/a"b\\c.jpg';
    const code = await getMacroLoad({ placeholder: false })(
      `${path}?vite-image`,
    );
    const expectedSpecifier = `${path}?w=640%3B1024%3B1920&format=webp%3Bjpeg&quality=80&as=picture`;

    expect(code).toContain(`import picture from ${JSON.stringify(expectedSpecifier)};`);
    expect(code).not.toContain(`import picture from "${path}?`);
  });
});
