# @son426/vite-image demo

This Vite 8 and React 19 application consumes `@son426/vite-image` from the
pnpm workspace. It demonstrates the v1 `?vite-image` import, AVIF and WebP
`<source>` output, a responsive fill layout, the blur lifecycle, and a forwarded
image ref.

The comparison reports only browser-observed values. It reads `currentSrc` and
natural dimensions from the loaded `HTMLImageElement`, then measures the selected
response with `fetch(url).blob().size`. It does not present cache-sensitive load
times, synthetic CLS values, or fixed compression claims.

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --dir demo dev
```

Verify the demo with:

```sh
pnpm demo:lint
pnpm demo:build
```

Node.js 22 or newer is required.
