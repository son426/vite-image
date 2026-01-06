import type { PluginOption } from "vite";
import { imagetools } from "vite-imagetools";
import { createFilter } from "@rollup/pluginutils";
import type { ViteImageConfig, AutoApplyConfig } from "../types";

export type ViteImagePluginOptions = Parameters<typeof imagetools>[0];

// Re-export types for convenience
export type { ViteImageConfig, AutoApplyConfig } from "../types";

// Default configuration
const DEFAULT_BREAKPOINTS = [640, 1024, 1920];

// Utility functions
function getFileExtension(id: string): string | null {
  // 쿼리 파라미터 제거
  const [basePath] = id.split("?");

  // 확장자 추출
  const match = basePath.match(/\.([^.]+)$/);
  return match ? `.${match[1]}` : null;
}

function matchesExtension(id: string, extensions: string[]): boolean {
  if (!extensions || extensions.length === 0) return false;

  const ext = getFileExtension(id);
  if (!ext) return false;

  return extensions.includes(ext);
}

function generateSrcSetParams(breakpoints: number[]): string {
  return `w=${breakpoints.join(";")}&format=webp&as=srcset`;
}

function generateMetaParams(breakpoints: number[]): string {
  const maxWidth = Math.max(...breakpoints);
  return `w=${maxWidth}&format=webp&as=meta`;
}

function generateImageCode(basePath: string, breakpoints: number[]): string {
  const srcSetParams = generateSrcSetParams(breakpoints);
  const metaParams = generateMetaParams(breakpoints);
  const lqipParams = "w=20&blur=2&quality=20&format=webp&inline";

  // meta를 먼저 import하고, 그 다음에 srcSet과 blurDataURL을 import
  // 이렇게 하면 초기화 순서 문제를 방지할 수 있음
  return `
    import meta from "${basePath}?${metaParams}";
    import srcSet from "${basePath}?${srcSetParams}";
    import blurDataURL from "${basePath}?${lqipParams}";
    
    export default {
      src: meta.src,
      width: meta.width,
      height: meta.height,
      srcSet: srcSet,
      blurDataURL: blurDataURL
    };
  `;
}

function shouldAutoApply(
  id: string,
  autoApply: AutoApplyConfig | undefined,
  filter: ((id: string) => boolean) | null
): boolean {
  // autoApply 설정이 없으면 false
  if (!autoApply) return false;

  // extensions가 없거나 빈 배열이면 false
  if (!autoApply.extensions || autoApply.extensions.length === 0) {
    return false;
  }

  // 확장자 매칭
  if (!matchesExtension(id, autoApply.extensions)) {
    return false;
  }

  // glob 패턴 매칭 (include/exclude)
  if (filter && !filter(id)) {
    return false;
  }

  return true;
}

/**
 * Vite plugin for image optimization using vite-imagetools
 * This plugin handles ?vite-image queries and uses imagetools for image processing
 *
 * @param config - Configuration options for vite-image plugin
 * @returns Array of Vite plugins (vite-image macro and imagetools)
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import { viteImage } from '@son426/vite-image/plugin';
 *
 * export default defineConfig({
 *   plugins: [
 *     ...viteImage({
 *       breakpoints: [640, 1024, 1920],
 *       autoApply: {
 *         extensions: ['.jpg', '.png'],
 *         include: ['src/**'],
 *         exclude: ['src/icons/**']
 *       }
 *     }),
 *   ],
 * });
 * ```
 */
export function viteImage(config?: ViteImageConfig): PluginOption[] {
  // Config 병합
  const breakpoints = config?.breakpoints ?? DEFAULT_BREAKPOINTS;
  const autoApply = config?.autoApply;
  const imagetoolsOptions = config?.imagetools;

  // Glob 필터 생성 (autoApply가 있을 때만)
  const filter = autoApply
    ? createFilter(autoApply.include, autoApply.exclude)
    : null;

  // 커스텀 플러그인: ?vite-image 쿼리를 처리
  const viteImageMacro: PluginOption = {
    name: "vite-plugin-vite-image-macro",
    enforce: "pre" as const,
    async load(id: string) {
      const [basePath, search] = id.split("?");
      const params = new URLSearchParams(search);

      // 1. 명시적 쿼리 체크 (기존 로직)
      if (params.has("vite-image")) {
        return generateImageCode(basePath, breakpoints);
      }

      // 2. autoApply 체크
      if (shouldAutoApply(id, autoApply, filter)) {
        // ?vite-image 쿼리를 자동으로 추가하여 처리
        return generateImageCode(basePath, breakpoints);
      }

      return null;
    },
  };

  return [viteImageMacro, imagetools(imagetoolsOptions)];
}
