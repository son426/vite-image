/**
 * Type definitions for vite-image
 */

// ?vite-image import 결과 타입
export interface ResponsiveImageData {
  src: string;
  width: number;
  height: number;
  srcSet?: string;
  lqipSrc?: string;
}
