/// <reference types="vite/client" />

/**
 * Type definitions for vite-imagetools query parameters
 * These types extend the default vite-imagetools types
 */

import type { ResponsiveImageData } from "./types";

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
