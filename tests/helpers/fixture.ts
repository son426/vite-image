import { mkdtemp, mkdir, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

export const projectRoot = fileURLToPath(new URL("../..", import.meta.url));

export interface ImageFixture {
  root: string;
  pngPath: string;
  jpegPath: string;
  cleanup: () => Promise<void>;
}

export async function createImageFixture(prefix: string): Promise<ImageFixture> {
  const root = await realpath(await mkdtemp(join(tmpdir(), prefix)));
  const sourceDirectory = join(root, "src");
  const pngPath = join(sourceDirectory, "hero.png");
  const jpegPath = join(sourceDirectory, "hero.jpg");

  await mkdir(sourceDirectory, { recursive: true });

  const pixels = Buffer.alloc(6 * 4 * 4);
  for (let index = 0; index < 6 * 4; index += 1) {
    const offset = index * 4;
    pixels[offset] = (index * 31) % 256;
    pixels[offset + 1] = (index * 47) % 256;
    pixels[offset + 2] = (index * 67) % 256;
    pixels[offset + 3] = 255;
  }

  const image = sharp(pixels, {
    raw: { width: 6, height: 4, channels: 4 },
  });
  await Promise.all([
    image.clone().png().toFile(pngPath),
    image.clone().jpeg({ quality: 90 }).toFile(jpegPath),
  ]);

  return {
    root,
    pngPath,
    jpegPath,
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
}

export async function writeFixtureFile(
  root: string,
  relativePath: string,
  contents: string,
): Promise<void> {
  const path = join(root, relativePath);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
}

export async function linkConsumerDependencies(root: string): Promise<void> {
  const modulesDirectory = join(root, "node_modules");
  const packageScope = join(modulesDirectory, "@son426");
  await mkdir(packageScope, { recursive: true });

  await Promise.all([
    symlink(projectRoot, join(packageScope, "vite-image"), "dir"),
    symlink(
      dirname(fileURLToPath(import.meta.resolve("react/package.json"))),
      join(modulesDirectory, "react"),
      "dir",
    ),
    symlink(
      dirname(fileURLToPath(import.meta.resolve("react-dom/package.json"))),
      join(modulesDirectory, "react-dom"),
      "dir",
    ),
  ]);
}
