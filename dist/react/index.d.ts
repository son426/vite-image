import * as react_jsx_runtime from 'react/jsx-runtime';
import { ImgHTMLAttributes } from 'react';

/**
 * Type definitions for vite-image
 */
interface ResponsiveImageData {
    src: string;
    width: number;
    height: number;
    srcSet?: string;
    lqipSrc?: string;
}

interface BaseImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "width" | "height" | "src" | "srcSet"> {
    sizes?: string;
    src?: string;
    srcSet?: string;
    lqipSrc?: string;
    width?: number;
    height?: number;
    imgData?: ResponsiveImageData;
}
interface FillImageProps extends BaseImageProps {
    fill: true;
}
interface StandardImageProps extends BaseImageProps {
    fill?: false | undefined;
}
type ImageProps = FillImageProps | StandardImageProps;
declare function Image({ imgData, src, srcSet, lqipSrc, width, height, fill, sizes, className, style, ...props }: ImageProps): react_jsx_runtime.JSX.Element | null;

export { type ImageProps, type ResponsiveImageData, Image as default };
