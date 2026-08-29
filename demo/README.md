# @son426/vite-image demo

This Vite 8 and React 19 application consumes `@son426/vite-image` from the
pnpm workspace. It demonstrates the v1 `?vite-image` import, AVIF and WebP
`<source>` output, a responsive fill layout, the blur lifecycle, and a forwarded
image ref.

The comparison reads `currentSrc` and natural dimensions from the loaded
`HTMLImageElement`. After `load`, it makes a separate `fetch(currentSrc)` request,
which the browser may serve from cache, and reports `response.blob().size`. That
value is the response body size after HTTP content decoding, not bytes transferred
over the wire. The demo does not present load times, synthetic CLS values, or
fixed compression claims.

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
