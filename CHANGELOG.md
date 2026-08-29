# Changelog

## 1.0.0 - Unreleased

### Added

- Typed responsive image metadata with ordered AVIF and WebP sources, an
  input-format fallback, and an optional inline blur placeholder.
- Strict configuration validation for widths, formats, quality, cache, metadata,
  and placeholder settings.
- A React renderer with native image props, required alt text, fill layout,
  forwarded refs, priority hints, and React 18 and 19 SSR support.
- Real Vite 7 and 8 integration tests, React 18 and 19 package-consumer tests,
  Chromium candidate-selection tests, package linting, and vulnerability gates.
- A tokenless npm trusted-publishing workflow with automatic provenance.

### Changed

- Replaced `breakpoints` with `widths` and removed implicit `autoApply` behavior.
- Replaced `ResponsiveImageData` with `OptimizedImageData`.
- Restricted activation to the exact, valueless `?vite-image` query.
- Moved React `className` and `style` props to the real image element and added
  explicit wrapper props.
- Removed the `overrideSrc` and raw imagetools escape-hatch APIs.
- Set the supported runtime range to Node.js 22+, Vite 7 or 8, React 18 or 19,
  and TypeScript 5.4+.
- Made React peers optional for plugin-only consumers.

### Fixed

- Removed the React DOM preload import that broke React 18 SSR module loading.
- Updated the image processing dependency tree to patched `sharp` releases.
- Prevented configured widths from upscaling source images.
- Let browsers use responsive width candidates when `sizes` is omitted.
- Settled blur overlays for images loaded before hydration and matched their
  object-fit geometry to the rendered image.
