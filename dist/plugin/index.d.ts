import { PluginOption } from 'vite';
import { imagetools } from 'vite-imagetools';
import { V as ViteImageConfig } from '../types-B08JIQxT.js';
export { A as AutoApplyConfig } from '../types-B08JIQxT.js';

type ViteImagePluginOptions = Parameters<typeof imagetools>[0];

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
declare function viteImage(config?: ViteImageConfig): PluginOption[];

export { ViteImageConfig, type ViteImagePluginOptions, viteImage };
