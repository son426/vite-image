/**
 * Type definitions for vite-image
 */

// ?vite-image import 결과 타입
export interface ResponsiveImageData {
  src: string;
  width: number;
  height: number;
  srcSet?: string;
  blurDataURL?: string; // Base64 encoded blur placeholder (Next.js Image compatible)
}

// Plugin configuration types
export interface AutoApplyConfig {
  extensions?: string[];
  include?: string[];
  exclude?: string[];
}

// ViteImagePluginOptions는 plugin/index.ts에서 정의되므로 여기서는 타입만 참조
type ViteImagePluginOptions = Parameters<
  typeof import("vite-imagetools").imagetools
>[0];

export interface ViteImageConfig {
  breakpoints?: number[];
  autoApply?: AutoApplyConfig;
  imagetools?: ViteImagePluginOptions;
}
