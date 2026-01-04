import { PluginOption } from 'vite';
import { imagetools } from 'vite-imagetools';

type ViteImagePluginOptions = Parameters<typeof imagetools>[0];
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
declare function viteImage(options?: ViteImagePluginOptions): PluginOption[];

export { type ViteImagePluginOptions, viteImage };
