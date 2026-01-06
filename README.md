# @son426/vite-image

**The Next.js `<Image />` experience, now in Vite.**

- **Bring the power of Next.js's automatic image optimization to your Vite projects.**
- **Dedicated to the Vite + React ecosystem.**

Simply add the plugin to your config, and start using the `<Image />` component immediately. No complex setups, just performant images.

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
      fill
      priority
      placeholder="blur"
      className="rounded-lg"
      onLoad={(e) => {}}
      onError={(e) => {}}
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

- vite (>= 4.0.0)
- react (>= 18.0.0)
- react-dom (>= 18.0.0)

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
  return <Image src={bgImage} fill={false} alt="Description" />;
}
```

**Important**: When using `?vite-image`, the `src` prop must receive the imported object directly. String URLs are not supported for `?vite-image` imports.

The `?vite-image` query automatically generates:

- `src`: Optimized image URL
- `srcSet`: Responsive srcSet string
- `blurDataURL`: Low Quality Image Placeholder (base64 inline)
- `width` and `height`: Image dimensions

#### Usage Examples

**Basic usage:**

```tsx
import Image from "@son426/vite-image/react";
import heroImage from "@/assets/hero.jpg?vite-image";

<Image src={heroImage} alt="Hero" />;
```

**Fill mode (container-filling images):**

```tsx
<div style={{ position: "relative", width: "100%", height: "400px" }}>
  <Image src={bgImage} fill alt="Background" />
</div>
```

**With priority (LCP images):**

```tsx
<Image src={heroImage} alt="Hero" priority />
```

**With blur placeholder:**

```tsx
<Image src={heroImage} alt="Hero" placeholder="blur" />
```

**Without placeholder:**

```tsx
<Image src={heroImage} alt="Hero" placeholder="empty" />
```

**Custom data URL placeholder:**

```tsx
<Image src={heroImage} alt="Hero" placeholder="data:image/jpeg;base64,..." />
```

**Custom sizes:**

```tsx
<Image src={heroImage} alt="Hero" sizes="(max-width: 768px) 100vw, 50vw" />
```

**With onLoad and onError callbacks:**

```tsx
<Image
  src={heroImage}
  alt="Hero"
  onLoad={(e) => console.log("Image loaded", e)}
  onError={(e) => console.error("Image failed to load", e)}
/>
```

**Combined usage:**

```tsx
<div style={{ position: "relative", width: "100%", height: "600px" }}>
  <Image
    src={heroImage}
    alt="Hero"
    fill
    priority
    placeholder="blur"
    className="rounded-lg"
    onLoad={(e) => console.log("Loaded")}
  />
</div>
```

## API

### Image Props

| Prop          | Type                                                      | Required | Default   | Description                                                             |
| ------------- | --------------------------------------------------------- | -------- | --------- | ----------------------------------------------------------------------- |
| `src`         | `ResponsiveImageData`                                     | Yes      | -         | Image data object from `?vite-image` query                              |
| `fill`        | `boolean`                                                 | No       | `false`   | Fill container mode (requires parent with `position: relative`)         |
| `sizes`       | `string`                                                  | No       | auto      | Sizes attribute (auto-calculated from srcSet if not provided)           |
| `priority`    | `boolean`                                                 | No       | `false`   | High priority loading (preload + eager + fetchPriority high)            |
| `placeholder` | `'empty' \| 'blur' \| string`                             | No       | `'empty'` | Placeholder type: `'empty'` (none), `'blur'` (blurDataURL), or data URL |
| `onLoad`      | `(event: React.SyntheticEvent<HTMLImageElement>) => void` | No       | -         | Callback fired when image loads successfully                            |
| `onError`     | `(event: React.SyntheticEvent<HTMLImageElement>) => void` | No       | -         | Callback fired when image fails to load                                 |
| `className`   | `string`                                                  | No       | -         | Additional CSS classes                                                  |
| `style`       | `CSSProperties`                                           | No       | -         | Additional inline styles                                                |
| `...props`    | `ImgHTMLAttributes`                                       | No       | -         | All standard img element attributes                                     |

**Notes**:

- The `src` prop must be an object imported from `?vite-image` query. String URLs are not supported.
- The `width` and `height` are automatically extracted from the `src` object.
- When `priority={true}`, the image is preloaded using `react-dom`'s `preload` API and loaded with `loading="eager"` and `fetchPriority="high"`.
- When `sizes` is not provided, it's automatically calculated from `srcSet` breakpoints.

### ResponsiveImageData

The type returned from `?vite-image` query:

```typescript
interface ResponsiveImageData {
  src: string;
  width: number;
  height: number;
  srcSet?: string;
  blurDataURL?: string; // Base64 encoded blur placeholder (Next.js Image compatible)
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
   - Blur placeholder (20px width, blurred, low quality, inline base64 as `blurDataURL`)

2. **Image Component**: The `<Image />` component handles:
   - Automatic `sizes` calculation from `srcSet` breakpoints
   - Placeholder display (`blur`, `empty`, or custom data URL)
   - Priority loading with `react-dom`'s `preload` API when `priority={true}`
   - Responsive image loading with srcSet
   - Proper aspect ratio maintenance
   - Fill mode for container-filling images

## License

MIT


