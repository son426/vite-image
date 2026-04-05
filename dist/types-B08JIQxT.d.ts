import * as vite_imagetools from 'vite-imagetools';

/**
 * Type definitions for vite-image
 */
interface ResponsiveImageData {
    src: string;
    width: number;
    height: number;
    srcSet?: string;
    blurDataURL?: string;
}
interface AutoApplyConfig {
    extensions?: string[];
    include?: string[];
    exclude?: string[];
}
type ViteImagePluginOptions = Parameters<typeof vite_imagetools.imagetools>[0];
interface ViteImageConfig {
    breakpoints?: number[];
    autoApply?: AutoApplyConfig;
    imagetools?: ViteImagePluginOptions;
}

export type { AutoApplyConfig as A, ResponsiveImageData as R, ViteImageConfig as V };
