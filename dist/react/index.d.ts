import * as react_jsx_runtime from 'react/jsx-runtime';
import { ImgHTMLAttributes } from 'react';
import { R as ResponsiveImageData } from '../types-B08JIQxT.js';
import 'vite-imagetools';

type PlaceholderValue = "empty" | "blur" | `data:image/${string}`;
interface BaseImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width" | "height"> {
    src: ResponsiveImageData;
    sizes?: string;
    placeholder?: PlaceholderValue;
    blurDataURL?: string;
    loading?: "lazy" | "eager";
    priority?: boolean;
    onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
    onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}
interface FillImageProps extends BaseImageProps {
    fill: true;
}
interface StandardImageProps extends BaseImageProps {
    fill?: false | undefined;
}
type ImageProps = FillImageProps | StandardImageProps;
declare function Image({ src, // 이제 이 src는 객체입니다.
fill, sizes, placeholder, // 기본값: empty (Next.js Image 호환)
blurDataURL: customBlurDataURL, // 사용자가 직접 제공한 blurDataURL (우선순위 높음)
loading, // loading prop (priority보다 낮은 우선순위)
priority, // 기본값: false (Next.js Image 호환)
className, style, onLoad, onError, ...props }: ImageProps): react_jsx_runtime.JSX.Element;

export { type ImageProps, ResponsiveImageData, Image as default };
