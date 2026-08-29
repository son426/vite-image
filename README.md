# @son426/vite-image

`@son426/vite-image` turns local static images into typed responsive-image
metadata during a Vite build. Its React component renders that metadata as a
native `<picture>` and `<img>` tree.

[Live demo](https://vite-image.web.app) ·
[npm](https://www.npmjs.com/package/@son426/vite-image) ·
[issues](https://github.com/son426/vite-image/issues)

The package opts images in explicitly with `?vite-image`. It generates width
candidates, ordered AVIF or WebP sources, an input-format fallback, and an
optional inline blur placeholder. It does not optimize remote URLs at runtime.

## Requirements

- Node.js 22 or newer
- Vite 7 or 8
- React and React DOM 18 or 19 when using `@son426/vite-image/react`
- TypeScript 5.4 or newer for TypeScript projects
- An ESM project

## Install

```sh
pnpm add @son426/vite-image
```

`vite`, `react`, and `react-dom` are peer dependencies. Install the peers your
application uses.

## Set up the plugin

`viteImage()` returns an array of Vite plugins, so spread it into `plugins`.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteImage } from "@son426/vite-image/plugin";

export default defineConfig({
  plugins: [
    react(),
    ...viteImage({
      widths: [480, 960, 1440],
      formats: ["avif", "webp"],
    }),
  ],
});
```

For TypeScript, include the client declarations in a file covered by your
`tsconfig.json`:

```ts
// src/vite-env.d.ts
/// <reference types="vite/client" />
/// <reference types="@son426/vite-image/client" />
```

## Import and render an image

The exact, valueless `?vite-image` query activates the plugin. No other query
parameter may accompany it.

```tsx
import Image from "@son426/vite-image/react";
import hero from "./assets/hero.jpg?vite-image";

export function Hero() {
  return <Image src={hero} alt="Mountain landscape" placeholder="blur" />;
}
```

The component accepts a string URL as a native pass-through source. String
sources do not support the generated blur placeholder.

```tsx
<Image
  src="/images/hero.jpg"
  srcSet="/images/hero-640.jpg 640w, /images/hero-1280.jpg 1280w"
  sizes="(max-width: 700px) 100vw, 700px"
  width={1280}
  height={720}
  alt="Mountain landscape"
/>
```

### Fill layout

`fill` requires an explicit `sizes` value. Give the containing element a
positioning context and set cropping or fitting through the image's `style`.

```tsx
<div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
  <Image
    src={hero}
    alt="Mountain landscape"
    fill
    sizes="(max-width: 768px) 100vw, 960px"
    placeholder="blur"
    style={{ objectFit: "cover" }}
  />
</div>
```

## Plugin API

```ts
interface ViteImageConfig {
  widths?: readonly number[];
  formats?: readonly ("avif" | "webp")[];
  quality?: number;
  placeholder?:
    | false
    | {
        width?: number;
        quality?: number;
        blur?: number;
      };
  cache?:
    | false
    | {
        dir?: string;
        retention?: number;
      };
  removeMetadata?: boolean;
}
```

| Option | Default | Rules |
| --- | --- | --- |
| `widths` | `[640, 1024, 1920]` | Non-empty, strictly increasing positive integers. Widths above the input's intrinsic width are clamped and deduplicated. |
| `formats` | `["webp"]` | Non-empty ordered list containing `"avif"` or `"webp"`, without duplicates. |
| `quality` | `80` | Integer from 1 through 100. Applies to responsive output, including the input-format fallback. |
| `placeholder` | `{ width: 20, quality: 20, blur: 2 }` | Set to `false` to omit `blurDataURL`. `width` must be a positive integer, `quality` must be from 1 through 100, and `blur` must be from 0.3 through 1000. |
| `cache` | Enabled at `./node_modules/.cache/imagetools`, without expiry | Set to `false` to disable the transform cache. `dir` must be non-empty; `retention` is a non-negative integer in seconds. |
| `removeMetadata` | `true` | Removes source metadata from transformed output when enabled. |

Configuration is validated when Vite loads the plugin. Unknown keys, unsupported
formats, duplicate values, and out-of-range numbers throw a `TypeError` instead
of falling back silently.

Supported input extensions are `.jpg`, `.jpeg`, `.png`, `.webp`, and `.avif`.
SVG, GIF, BMP, and files without a supported extension are rejected.

### Output order and fallback

The plugin preserves the configured format order in `<source>` elements. It
moves the input format to the fallback position and avoids duplicating that
format as a `<source>`. For example, a JPEG imported with
`formats: ["avif", "webp"]` renders AVIF first, WebP second, and responsive JPEG
candidates on the fallback `<img>`.

Transforms never upscale an image. If the largest configured width exceeds the
input width, the intrinsic width becomes the final candidate.

## Generated data

Import the public types from the package root and use them with generated data:

```ts
import type {
  OptimizedImageData,
  OptimizedImageSource,
} from "@son426/vite-image";
import hero from "./assets/hero.jpg?vite-image";

hero satisfies OptimizedImageData;
export const firstSource: OptimizedImageSource | undefined = hero.sources?.[0];
```

- `OptimizedImageData` contains required `src`, `width`, and `height` fields,
  plus optional `srcSet`, `sources`, and `blurDataURL` fields.
- Each `OptimizedImageSource` contains a MIME `type` and its `srcSet`.
- `src`, `width`, and `height` describe the largest generated input-format
  fallback.
- `srcSet` contains fallback candidates.
- `sources` contains ordered MIME types and candidate sets for configured output
  formats.
- `blurDataURL` is an inline WebP data URL unless `placeholder` is `false`.

## React API

```ts
import Image, {
  Image as NamedImage,
  type ImageProps,
} from "@son426/vite-image/react";
```

`Image` accepts native image attributes except the fields it controls directly.
`alt` is always required.

| Prop | Behavior |
| --- | --- |
| `src` | Accepts `OptimizedImageData` or a string URL. A string source may use native `srcSet`, `sizes`, `width`, and `height`. |
| `fill` | Fills its positioned container. TypeScript requires `sizes` when `fill` is `true`; rendered `width` and `height` attributes are omitted. |
| `sizes` | Passed to every generated `<source>` and the fallback `<img>`. A non-fill optimized image defaults to `"{metadata width}px"`; a string source has no default. |
| `width`, `height` | Override generated dimensions in standard layout. Generated metadata supplies defaults. |
| `placeholder` | `"empty"` by default. `"blur"` requires optimized data with `blurDataURL`, or a custom `blurDataURL` prop. |
| `priority` | Sets `loading="eager"` and `fetchPriority="high"`. The package does not call an explicit preload API. |
| `loading` | Defaults to `"lazy"` unless `priority` is set. |
| `decoding` | Defaults to `"async"`. |
| `className`, `style` | Apply to the real `<img>`. No `object-fit` value is imposed. |
| `wrapperClassName`, `wrapperStyle` | Apply to the component's wrapper `<span>`. |
| `ref` | Forwards to the real `HTMLImageElement`. |
| `onLoad`, `onError` | Receive native React image events. Either event settles the blur overlay. |

When `placeholder="blur"`, the component renders a presentation-only overlay
and fades it after the image loads or errors. The prop is available only for
optimized metadata at the type level. Requesting blur without a data URL also
throws a runtime `TypeError`.

## SSR

The React component renders on the server with React 18 and React 19. It does not
import browser globals or React DOM preload APIs. The Vite plugin still performs
image processing during development and builds; no image work runs in the SSR
request path.

## Limitations

- Only local static files imported at build time can be transformed.
- Remote and public URLs pass through as strings; the package does not download,
  cache, or optimize them.
- SVG and animated GIF inputs are outside the transform pipeline.
- The package is not a runtime image CDN and does not negotiate formats on a
  server.
- You remain responsible for an accurate `sizes` expression. Browser selection
  can over-fetch when `sizes` overstates the rendered width.
- `fill` controls layout, not cropping. Set `objectFit` and `objectPosition` on
  `style` when needed.

## Development and verification

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm check:browser
pnpm package:check
```

`pnpm check` runs strict TypeScript checks, ESLint, unit tests, real Vite
integration tests, a packed consumer test, and the demo's lint and build gates.
The packed consumer covers TypeScript 5.4, React 18 SSR, and Vite 7. The main
workspace covers TypeScript 5.9, React 19, and Vite 8. Browser tests run the built
package in Chromium. `pnpm package:check` runs the build, publint, and
Are the Types Wrong.

## License

[MIT](./LICENSE)
