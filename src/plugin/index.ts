import type { PluginOption } from "vite";
import { imagetools } from "vite-imagetools";

export type ViteImagePluginOptions = Parameters<typeof imagetools>[0];

/**
 * Vite plugin for image optimization using vite-imagetools
 * This plugin handles ?vite-image queries and uses imagetools for image processing
 *
 * @param options - Options to pass to vite-imagetools
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
 *     ...viteImage(),
 *   ],
 * });
 * ```
 */
export function viteImage(options?: ViteImagePluginOptions): PluginOption[] {
  // 커스텀 플러그인: ?vite-image 쿼리를 처리
  const viteImageMacro: PluginOption = {
    name: "vite-plugin-vite-image-macro",
    enforce: "pre" as const,
    async load(id: string) {
      const [basePath, search] = id.split("?");
      const params = new URLSearchParams(search);

      if (params.has("vite-image")) {
        const srcSetParams = "w=640;1024;1920&format=webp&as=srcset";
        const metaParams = "w=1920&format=webp&as=meta";
        const lqipParams = "w=20&blur=2&quality=20&format=webp&inline";

        return `
          import srcSet from "${basePath}?${srcSetParams}";
          import meta from "${basePath}?${metaParams}";
          import lqipSrc from "${basePath}?${lqipParams}";
          
          export default {
            src: meta.src,
            width: meta.width,
            height: meta.height,
            srcSet: srcSet,
            lqipSrc: lqipSrc, // Deprecated: 하위 호환성을 위해 유지
            blurDataURL: lqipSrc // Next.js Image 호환성을 위한 blurDataURL
          };
        `;
      }

      return null;
    },
  };

  return [viteImageMacro, imagetools(options)];
}
