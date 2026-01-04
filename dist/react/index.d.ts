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

interface BaseImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width" | "height"> {
    src: ResponsiveImageData;
    sizes?: string;
}
interface FillImageProps extends BaseImageProps {
    fill: true;
}
interface StandardImageProps extends BaseImageProps {
    fill?: false | undefined;
}
type ImageProps = FillImageProps | StandardImageProps;
declare function Image({ src, // 이제 이 src는 객체입니다.
fill, sizes, className, style, ...props }: ImageProps): react_jsx_runtime.JSX.Element;

export { type ImageProps, type ResponsiveImageData, Image as default };
