/// <reference types="vite/client" />

/**
 * Type definitions for vite-imagetools query parameters
 * These types extend the default vite-imagetools types
 */

// ?vite-image import 결과 타입
interface ResponsiveImageData {
  src: string;
  width: number;
  height: number;
  srcSet?: string;
  lqipSrc?: string;
}

// vite-image 쿼리 파라미터 타입
declare module "*?vite-image" {
  const imageData: ResponsiveImageData;
  export default imageData;
}

// srcset 타입
declare module "*?w=*&format=*&as=srcset" {
  const srcset: string;
  export default srcset;
}

// meta 타입
declare module "*?w=*&format=*&as=meta" {
  interface ImageMeta {
    src: string;
    width: number;
    height: number;
    format?: string;
  }
  const meta: ImageMeta;
  export default meta;
}

// inline (LQIP) 타입
declare module "*?w=*&blur=*&quality=*&format=*&inline" {
  const src: string;
  export default src;
}

// 일반 imagetools 확장
declare module "*&imagetools" {
  type ImageToolsOutput =
    | string // 기본 출력
    | { src: string; width: number; height: number } // meta
    | string; // srcset

  const out: ImageToolsOutput;
  export default out;
}
