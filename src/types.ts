/**
 * Type definitions for vite-image
 */

// ?vite-image import 결과 타입
export interface ResponsiveImageData {
  src: string;
  width: number;
  height: number;
  srcSet?: string;
  lqipSrc?: string; // Deprecated: use blurDataURL instead
  blurDataURL?: string; // Base64 encoded blur placeholder (Next.js Image compatible)
}
