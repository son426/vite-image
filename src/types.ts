export interface OptimizedImageSource {
  type: string;
  srcSet: string;
}

export interface OptimizedImageData {
  src: string;
  width: number;
  height: number;
  srcSet?: string;
  sources?: OptimizedImageSource[];
  blurDataURL?: string;
}

export interface ViteImageConfig {
  widths?: readonly number[];
  formats?: readonly ("avif" | "webp")[];
  quality?: number;
  placeholder?:
    | false
    | {
        width?: number;
        quality?: number;
        blur?: number;
      };
  cache?:
    | false
    | {
        dir?: string;
        retention?: number;
      };
  removeMetadata?: boolean;
}
