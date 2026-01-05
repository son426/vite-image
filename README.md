# @son426/vite-image

**The Next.js `<Image />` experience, now in Vite.**

- **Bring the power of Next.js's automatic image optimization to your Vite projects.**
- **Dedicated to the Vite + React ecosystem.**

BSimply add the plugin to your config, and start using the `<Image />` component immediately. No complex setups, just performant images.

## ✨ Why use this?

- **⚡ Next.js-like Experience**: Familiar Image API for those coming from Next.js.
- **🖼️ Zero-Config Optimization**: Automatic format conversion, resizing, and compression via `vite-imagetools`.
- **🎨 Built-in LQIP**: Automatic Low Quality Image Placeholders (blur effect) while loading.
- **📱 Responsive Ready**: Auto-generated `srcSet` and `sizes` for all viewports.
- **🎯 Type-Safe**: Full TypeScript support with tight integration.

---

## 🚀 Quick Look

Add it to `vite.config.ts`, and use it like this:

```tsx
import Image from "@son426/vite-image/react";
// 1. Import with the required query
import myBg from "./assets/background.jpg?vite-image";

export default function Page() {
  return (
    // 2. Pass the object directly to src
    <Image
      src={myBg}
      alt="Optimized Background"
      fill // Optional: Fill parent container
    />
  );
}
```

## Installation

Since `vite-imagetools` is handled internally, you only need to install this package.

```bash
pnpm add @son426/vite-image
# or
npm install @son426/vite-image
# or
yarn add @son426/vite-image
```

## Requirements

Just a standard Vite + React project.

vite (>= 4.0.0)
react (>= 18.0.0)

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
