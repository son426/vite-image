import assert from "node:assert/strict";
import console from "node:console";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL, URL } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const temporaryRoot = await mkdtemp(join(tmpdir(), "vite-image-package-consumer-"));

function run(command, args, cwd) {
  execFileSync(command, args, {
    cwd,
    env: { ...process.env, CI: "1" },
    stdio: "inherit",
  });
}

try {
  run("pnpm", ["run", "build"], projectRoot);

  const packDirectory = join(temporaryRoot, "pack");
  const extractDirectory = join(temporaryRoot, "extract");
  const consumerDirectory = join(temporaryRoot, "consumer");
  await Promise.all([
    mkdir(packDirectory),
    mkdir(extractDirectory),
    mkdir(join(consumerDirectory, "src"), { recursive: true }),
  ]);

  run(
    "pnpm",
    ["pack", "--pack-destination", packDirectory],
    projectRoot,
  );
  const archives = (await readdir(packDirectory)).filter((file) =>
    file.endsWith(".tgz"),
  );
  assert.equal(archives.length, 1, "pnpm pack must produce one archive");
  const archivePath = join(packDirectory, archives[0]);
  run("tar", ["-xzf", archivePath, "-C", extractDirectory], projectRoot);

  const packedRoot = join(extractDirectory, "package");
  const packedManifest = JSON.parse(
    await readFile(join(packedRoot, "package.json"), "utf8"),
  );
  assert.deepEqual(Object.keys(packedManifest.exports).sort(), [
    ".",
    "./client",
    "./plugin",
    "./react",
  ]);
  assert.equal(packedManifest.exports["./client"].types, "./client.d.ts");
  await Promise.all([
    readFile(join(packedRoot, "dist/index.js")),
    readFile(join(packedRoot, "dist/index.d.ts")),
    readFile(join(packedRoot, "dist/plugin/index.js")),
    readFile(join(packedRoot, "dist/plugin/index.d.ts")),
    readFile(join(packedRoot, "dist/react/index.js")),
    readFile(join(packedRoot, "dist/react/index.d.ts")),
    readFile(join(packedRoot, "client.d.ts")),
  ]);

  await writeFile(
    join(consumerDirectory, "package.json"),
    `${JSON.stringify(
      {
        private: true,
        type: "module",
        dependencies: {
          "@son426/vite-image": `file:${archivePath}`,
          react: "18.2.0",
          "react-dom": "18.2.0",
        },
        devDependencies: {
          "@types/node": "22.12.0",
          "@types/react": "18.2.79",
          "@types/react-dom": "18.2.25",
          typescript: "5.4.5",
          vite: "7.2.4",
        },
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(
    join(consumerDirectory, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          lib: ["ES2022", "DOM", "ESNext.Disposable"],
          strict: true,
          skipLibCheck: false,
          noEmit: true,
        },
        include: ["src"],
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(
    join(consumerDirectory, "src/consumer.tsx"),
    `/// <reference types="@son426/vite-image/client" />
import type { OptimizedImageData } from "@son426/vite-image";
import { viteImage } from "@son426/vite-image/plugin";
import Image, { type ImageProps } from "@son426/vite-image/react";
import hero from "./hero.jpg?vite-image";

hero satisfies OptimizedImageData;
viteImage({ widths: [320, 640], formats: ["avif", "webp"] });
const props: ImageProps = { src: hero, alt: "Hero" };
export const view = <Image {...props} />;
`,
  );
  await writeFile(join(consumerDirectory, "src/hero.jpg"), "type-only fixture\n");
  await writeFile(
    join(consumerDirectory, "runtime.mjs"),
    `import assert from "node:assert/strict";
import * as root from "@son426/vite-image";
import { viteImage } from "@son426/vite-image/plugin";
import Image from "@son426/vite-image/react";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

assert.equal(typeof root, "object");
assert.equal(typeof viteImage, "function");
assert.equal(typeof Image, "object");
const markup = renderToStaticMarkup(React.createElement(Image, {
  src: "/hero.jpg",
  alt: "Hero",
  width: 6,
  height: 4,
}));
assert.ok(markup.includes('src="/hero.jpg"'));
`,
  );

  run(
    "npm",
    ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--loglevel=error"],
    consumerDirectory,
  );
  run(join(consumerDirectory, "node_modules/.bin/tsc"), ["-p", "tsconfig.json"], consumerDirectory);
  run(process.execPath, ["runtime.mjs"], consumerDirectory);

  const installedManifest = JSON.parse(
    await readFile(
      join(consumerDirectory, "node_modules/@son426/vite-image/package.json"),
      "utf8",
    ),
  );
  assert.equal(installedManifest.version, "1.0.0");
  assert.equal(
    pathToFileURL(
      join(consumerDirectory, "node_modules/@son426/vite-image/client.d.ts"),
    ).protocol,
    "file:",
  );

  console.log("packed consumer: exports, TS 5.4, and React 18 SSR passed");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
