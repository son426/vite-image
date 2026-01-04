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

**Important**: Use the spread operator (`...viteImage()`) to properly register both plugins.

### 2. Use the Component

#### Method 1: Using `?vite-image` query (Recommended)

The simplest way is to use the `?vite-image` query parameter, which automatically generates all required image data:

```typescript
import Image from "@son426/vite-image/react";
import bgImage from "@/assets/image.webp?vite-image";

function MyComponent() {
  return (
    <Image
      imgData={bgImage}
      fill={false}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
      alt="Description"
    />
  );
}
```

The `?vite-image` query automatically generates:

- `src`: Optimized image URL
- `srcSet`: Responsive srcSet string
- `lqipSrc`: Low Quality Image Placeholder (base64 inline)
- `width` and `height`: Image dimensions

#### Method 2: Using individual props

You can also import and use individual image data:

```typescript
import Image from "@son426/vite-image/react";

import imageSrcSet from "@/assets/image.webp?w=640;1024;1920&format=webp&as=srcset";
import imageMeta from "@/assets/image.webp?w=1920&format=webp&as=meta";
import imageLqipSrc from "@/assets/image.webp?w=20&blur=2&quality=20&format=webp&inline";

function MyComponent() {
  return (
    <Image
      src={imageMeta.src}
      srcSet={imageSrcSet}
      lqipSrc={imageLqipSrc}
      width={imageMeta.width}
      height={imageMeta.height}
      fill={false}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
      alt="Description"
    />
  );
}
```

### Fill Mode

For images that fill their container (similar to Next.js Image):

```typescript
<div style={{ position: "relative", width: "100%", height: "400px" }}>
  <Image imgData={bgImage} fill={true} sizes="100vw" alt="Description" />
</div>
```

## API

### Image Props

| Prop        | Type                  | Required | Description                                 |
| ----------- | --------------------- | -------- | ------------------------------------------- |
| `imgData`   | `ResponsiveImageData` | No\*     | Image data object from `?vite-image` query  |
| `src`       | `string`              | Yes\*    | Image source URL                            |
| `srcSet`    | `string`              | No       | Responsive image srcSet                     |
| `lqipSrc`   | `string`              | No       | Low Quality Image Placeholder source        |
| `fill`      | `boolean`             | No       | Fill container mode (default: `false`)      |
| `width`     | `number`              | Yes\*    | Image width (required when `fill={false}`)  |
| `height`    | `number`              | Yes\*    | Image height (required when `fill={false}`) |
| `sizes`     | `string`              | No       | Sizes attribute (default: `"100vw"`)        |
| `className` | `string`              | No       | Additional CSS classes                      |
| `style`     | `CSSProperties`       | No       | Additional inline styles                    |
| `...props`  | `ImgHTMLAttributes`   | No       | All standard img element attributes         |

\* Either `imgData` or `src` (with `width` and `height` when `fill={false}`) is required.

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
