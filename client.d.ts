// client.d.ts
/// <reference types="vite/client" />

/**
 * Type definitions for vite-imagetools query parameters
 * These types extend the default vite-imagetools types
 */

interface ResponsiveImageData {
  src: string;
  width: number;
  height: number;
  srcSet?: string;
  blurDataURL?: string; // Base64 encoded blur placeholder (Next.js Image compatible)
}

// vite-image 쿼리 파라미터 타입
declare module "*?vite-image" {
  const imageData: ResponsiveImageData;
  export default imageData;
}
