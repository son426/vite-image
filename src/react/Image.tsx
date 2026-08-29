import {
  forwardRef,
  useState,
  version as reactVersion,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ImgHTMLAttributes,
  type ReactElement,
} from "react";

import type { OptimizedImageData } from "../types";

type NativeImageProps = Omit<
  ComponentPropsWithoutRef<"img">,
  | "alt"
  | "src"
  | "srcSet"
  | "sizes"
  | "width"
  | "height"
  | "loading"
  | "decoding"
>;

interface SharedImageProps extends NativeImageProps {
  alt: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  decoding?: ImgHTMLAttributes<HTMLImageElement>["decoding"];
}

interface StandardLayoutProps {
  fill?: false | undefined;
  sizes?: string;
  width?: string | number;
  height?: string | number;
}

interface FillLayoutProps {
  fill: true;
  sizes: string;
  width?: string | number;
  height?: string | number;
}

interface OptimizedSourceProps {
  src: OptimizedImageData;
  srcSet?: never;
  placeholder?: "empty" | "blur";
  blurDataURL?: string;
}

interface StringSourceProps {
  src: string;
  srcSet?: string;
  placeholder?: never;
  blurDataURL?: never;
}

export type ImageProps = SharedImageProps &
  (StandardLayoutProps | FillLayoutProps) &
  (OptimizedSourceProps | StringSourceProps);

const STANDARD_WRAPPER_STYLE: CSSProperties = {
  position: "relative",
  display: "inline-block",
  overflow: "hidden",
  lineHeight: 0,
};

const FILL_WRAPPER_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  lineHeight: 0,
};

const FILL_IMAGE_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

const FETCH_PRIORITY_PROPERTY = reactVersion.startsWith("18.")
  ? "fetchpriority"
  : "fetchPriority";

function isOptimizedImage(
  src: OptimizedImageData | string,
): src is OptimizedImageData {
  return typeof src !== "string";
}

/** Renders optimized image metadata or a native image URL with the same API. */
export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    srcSet,
    sizes,
    width,
    height,
    fill = false,
    placeholder,
    blurDataURL: customBlurDataURL,
    priority = false,
    loading,
    decoding = "async",
    fetchPriority,
    alt,
    className,
    style,
    wrapperClassName,
    wrapperStyle,
    onLoad,
    onError,
    ...imageProps
  },
  ref,
) {
  const optimized = isOptimizedImage(src);
  const currentSrc = optimized ? src.src : src;
  const currentSrcSet = optimized ? src.srcSet : srcSet;
  const currentSizes = sizes ?? (optimized ? `${src.width}px` : undefined);
  const currentWidth = optimized ? (width ?? src.width) : width;
  const currentHeight = optimized ? (height ?? src.height) : height;
  const sources = optimized ? src.sources : undefined;
  const placeholderMode = optimized ? (placeholder ?? "empty") : "empty";
  const blurDataURL = optimized
    ? (customBlurDataURL ?? src.blurDataURL)
    : undefined;
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  if (placeholderMode === "blur" && !blurDataURL) {
    throw new TypeError(
      '[vite-image] placeholder="blur" requires a blurDataURL prop or optimized image metadata',
    );
  }

  const imageSettled = loadedSrc === currentSrc;
  const imageStyle = fill ? { ...FILL_IMAGE_STYLE, ...style } : style;
  const mergedWrapperStyle = {
    ...(fill ? FILL_WRAPPER_STYLE : STANDARD_WRAPPER_STYLE),
    ...wrapperStyle,
  };
  const loadingValue = priority ? "eager" : (loading ?? "lazy");
  const fetchPriorityValue = priority ? "high" : fetchPriority;
  const fetchPriorityProps = fetchPriorityValue
    ? { [FETCH_PRIORITY_PROPERTY]: fetchPriorityValue }
    : {};

  const image = (
    <img
      {...imageProps}
      {...fetchPriorityProps}
      ref={ref}
      src={currentSrc}
      srcSet={currentSrcSet}
      sizes={currentSizes}
      width={fill ? undefined : currentWidth}
      height={fill ? undefined : currentHeight}
      alt={alt}
      loading={loadingValue}
      decoding={decoding}
      className={className}
      style={imageStyle}
      onLoad={(event) => {
        setLoadedSrc(currentSrc);
        onLoad?.(event);
      }}
      onError={(event) => {
        setLoadedSrc(currentSrc);
        onError?.(event);
      }}
    />
  );

  const responsiveImage: ReactElement =
    sources && sources.length > 0 ? (
      <picture>
        {sources.map((source) => (
          <source
            key={`${source.type}:${source.srcSet}`}
            type={source.type}
            srcSet={source.srcSet}
            sizes={currentSizes}
          />
        ))}
        {image}
      </picture>
    ) : (
      image
    );

  return (
    <span className={wrapperClassName} style={mergedWrapperStyle}>
      {responsiveImage}
      {placeholderMode === "blur" && (
        <img
          src={blurDataURL}
          alt=""
          role="presentation"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            filter: "blur(20px)",
            transform: "scale(1.1)",
            transition: "opacity 300ms ease-out",
            opacity: imageSettled ? 0 : 1,
            pointerEvents: "none",
          }}
        />
      )}
    </span>
  );
});

Image.displayName = "Image";

export default Image;
