# @son426/vite-image

**Next.js-style Image component for Vite.**

This library provides a Next.js-like Image component experience in Vite. The core philosophy is to bring static bundler capabilities similar to Next.js Image component to Vite projects. Simply add `viteImage()` to your `vite.config.ts` and start using the `<Image />` component.

## Features

- 🖼️ **Optimized Images**: Automatic image optimization using vite-imagetools
- 🎨 **LQIP Support**: Low Quality Image Placeholder for smooth loading experience
- 📱 **Responsive Images**: Built-in support for srcSet and sizes attributes
- 🎯 **TypeScript**: Full TypeScript support with type definitions
- 🚀 **Simple Setup**: Easy configuration with sensible defaults

## Installation

```bash
pnpm add @son426/vite-image
# or
npm install @son426/vite-image
# or
yarn add @son426/vite-image
```

## Peer Dependencies

The following packages are required:

```bash
pnpm add react vite vite-imagetools
```

## Usage

### 1. Setup Vite Plugin

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import { viteImage } from "@son426/vite-image/plugin";

export default defineConfig({
  plugins: [
    // ... other plugins
    viteImage(),
  ],
});
```

**Important**: The `viteImage()` function returns an array of plugins, so you should spread it when adding to the plugins array.

### 2. Use the Component

#### Using `?vite-image` query (Required)

The `?vite-image` query parameter is required and automatically generates all required image data. When using `?vite-image`, the `src` prop must be an object (not a string).

```typescript
import Image from "@son426/vite-image/react";
import bgImage from "@/assets/image.webp?vite-image";

function MyComponent() {
  return (
    <Image
      src={bgImage}
      fill={false}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
      alt="Description"
    />
  );
}
```

**Important**: When using `?vite-image`, the `src` prop must receive the imported object directly. String URLs are not supported for `?vite-image` imports.

The `?vite-image` query automatically generates:

- `src`: Optimized image URL
- `srcSet`: Responsive srcSet string
- `lqipSrc`: Low Quality Image Placeholder (base64 inline)
- `width` and `height`: Image dimensions

### Fill Mode

For images that fill their container (similar to Next.js Image):

```typescript
<div style={{ position: "relative", width: "100%", height: "400px" }}>
  <Image src={bgImage} fill={true} sizes="100vw" alt="Description" />
</div>
```

## API

### Image Props

| Prop        | Type                  | Required | Description                                |
| ----------- | --------------------- | -------- | ------------------------------------------ |
| `src`       | `ResponsiveImageData` | Yes      | Image data object from `?vite-image` query |
| `fill`      | `boolean`             | No       | Fill container mode (default: `false`)     |
| `sizes`     | `string`              | No       | Sizes attribute (default: `"100vw"`)       |
| `className` | `string`              | No       | Additional CSS classes                     |
| `style`     | `CSSProperties`       | No       | Additional inline styles                   |
| `...props`  | `ImgHTMLAttributes`   | No       | All standard img element attributes        |

**Note**: The `src` prop must be an object imported from `?vite-image` query. String URLs are not supported. The `width` and `height` are automatically extracted from the `src` object.

### ResponsiveImageData

The type returned from `?vite-image` query:

```typescript
interface ResponsiveImageData {
  src: string;
  width: number;
  height: number;
  srcSet?: string;
  lqipSrc?: string;
}
```

## TypeScript

Type definitions are included. The package also extends vite-imagetools types for better TypeScript support:

```typescript
import Image from "@son426/vite-image/react";
import type { ImageProps, ResponsiveImageData } from "@son426/vite-image/react";
```

## How It Works

1. **`?vite-image` Query**: When you import an image with `?vite-image`, the plugin automatically generates:

   - Responsive srcSet (640px, 1024px, 1920px widths)
   - Image metadata (1920px width)
   - LQIP (20px width, blurred, low quality, inline base64)

2. **Image Component**: The `<Image />` component handles:
   - LQIP display while the main image loads
   - Responsive image loading with srcSet
   - Proper aspect ratio maintenance
   - Fill mode for container-filling images

## License

MIT
