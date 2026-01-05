import { useState, type ImgHTMLAttributes, type CSSProperties } from "react";
import { preload } from "react-dom";
import type { ResponsiveImageData } from "../types";

// placeholder 타입 정의 (Next.js Image 호환)
type PlaceholderValue = "empty" | "blur" | `data:image/${string}`;

// ?vite-image import 결과 타입
interface BaseImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "srcSet" | "width" | "height"
  > {
  // 핵심 변경: src는 무조건 최적화된 이미지 객체만 받음
  src: ResponsiveImageData;
  sizes?: string; // Optional: 제공되지 않으면 자동 계산
  placeholder?: PlaceholderValue; // Next.js Image 호환: 'empty' | 'blur' | 'data:image/...'
  blurDataURL?: string; // Optional: 커스텀 blur placeholder (src.blurDataURL보다 우선)
  loading?: "lazy" | "eager"; // Next.js Image 호환: 이미지 로딩 방식
  priority?: boolean; // Next.js Image 호환: true일 경우 높은 우선순위로 preload
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

interface FillImageProps extends BaseImageProps {
  fill: true;
}

interface StandardImageProps extends BaseImageProps {
  fill?: false | undefined;
}

export type ImageProps = FillImageProps | StandardImageProps;

/**
 * srcSet에서 breakpoints를 추출하여 sizes 문자열을 자동 생성
 * @param srcSet - "url1 640w, url2 1024w, url3 1920w" 형식의 문자열
 * @returns sizes 속성 문자열
 */
function generateSizesFromSrcSet(srcSet?: string): string {
  if (!srcSet) {
    return "100vw";
  }

  // srcSet에서 width 값들 추출 (예: "640w", "1024w", "1920w")
  const widthMatches = srcSet.match(/(\d+)w/g);
  if (!widthMatches || widthMatches.length === 0) {
    return "100vw";
  }

  // width 값들을 숫자로 변환하고 정렬
  const breakpoints = widthMatches
    .map((match) => parseInt(match.replace("w", ""), 10))
    .sort((a, b) => a - b);

  if (breakpoints.length === 0) {
    return "100vw";
  }

  // breakpoints를 기반으로 sizes 문자열 생성
  // 예: "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
  const sizeParts: string[] = [];

  for (let i = 0; i < breakpoints.length; i++) {
    const breakpoint = breakpoints[i];
    if (i === breakpoints.length - 1) {
      // 마지막 breakpoint는 최대 크기로 설정
      sizeParts.push(`${breakpoint}px`);
    } else {
      // 중간 breakpoint들은 미디어 쿼리로 설정
      sizeParts.push(`(max-width: ${breakpoint}px) 100vw`);
    }
  }

  return sizeParts.join(", ");
}

export default function Image({
  src, // 이제 이 src는 객체입니다.
  fill = false,
  sizes,
  placeholder = "empty", // 기본값: empty (Next.js Image 호환)
  blurDataURL: customBlurDataURL, // 사용자가 직접 제공한 blurDataURL (우선순위 높음)
  loading, // loading prop (priority보다 낮은 우선순위)
  priority = false, // 기본값: false (Next.js Image 호환)
  className = "",
  style,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // 1. 데이터 추출: src 객체에서 바로 꺼내씀 (병합 로직 제거)
  const {
    src: currentSrc,
    srcSet: currentSrcSet,
    blurDataURL: srcBlurDataURL, // 번들러가 생성한 blurDataURL
    width: currentWidth,
    height: currentHeight,
  } = src;

  // blurDataURL 우선순위: prop으로 제공된 것 > src 객체의 것
  const blurDataURL = customBlurDataURL ?? srcBlurDataURL;

  // 2. loading 속성 결정: 우선순위 priority > loading prop > 기본값('lazy')
  const loadingAttr = priority ? "eager" : loading ?? "lazy";

  // 3. sizes 자동 계산: 제공되지 않으면 srcSet 기반으로 자동 생성
  const computedSizes =
    sizes ?? (fill ? "100vw" : generateSizesFromSrcSet(currentSrcSet));

  // 4. Priority 처리: priority={true}일 때 preload
  if (priority && currentSrc) {
    preload(currentSrc, {
      as: "image",
      fetchPriority: "high",
      ...(currentSrcSet ? { imageSrcSet: currentSrcSet } : {}),
      ...(computedSizes ? { imageSizes: computedSizes } : {}),
    });
  }

  // 5. placeholder 처리 (Next.js Image 호환)
  const getPlaceholderSrc = (): string | undefined => {
    if (placeholder === "empty") {
      return undefined;
    }
    if (placeholder === "blur") {
      return blurDataURL;
    }
    // data:image/... 형식의 직접 제공된 placeholder
    if (placeholder.startsWith("data:image/")) {
      return placeholder;
    }
    // 기본값: empty
    return undefined;
  };

  const placeholderSrc = getPlaceholderSrc();
  const hasShowPlaceholder = !!placeholderSrc;

  // 5. 컨테이너 스타일 계산 (기존 로직 유지)
  const containerStyle: CSSProperties = fill
    ? {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }
    : {
        position: "relative",
        width: "100%",
        overflow: "hidden",
        // Standard 모드일 때 aspect-ratio 처리
        ...(currentWidth && currentHeight
          ? { aspectRatio: `${currentWidth} / ${currentHeight}` }
          : {}),
      };

  const mergedContainerStyle = { ...containerStyle, ...style };

  // 6. 실제 이미지 스타일 (기존 로직 유지)
  const imgStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  // 7. Placeholder 스타일 (blur 모드일 때만 blur 효과 적용)
  const placeholderStyle: CSSProperties = {
    ...imgStyle,
    transition: "opacity 500ms ease-out",
    opacity: isImageLoaded ? 0 : 1,
    zIndex: 1,
    pointerEvents: "none",

    // blur placeholder일 때만 blur 효과 적용
    ...(placeholder === "blur"
      ? {
          filter: "blur(20px)",
          transform: "scale(1.1)",
        }
      : {}),
  };

  return (
    <div className={className} style={mergedContainerStyle}>
      {/* 실제 이미지 */}
      <img
        {...props}
        src={currentSrc}
        srcSet={currentSrcSet}
        sizes={computedSizes}
        width={fill ? undefined : currentWidth}
        height={fill ? undefined : currentHeight}
        loading={loadingAttr}
        fetchPriority={priority ? "high" : undefined}
        onLoad={(e) => {
          setIsImageLoaded(true);
          onLoad?.(e);
        }}
        onError={onError}
        style={{ ...imgStyle, zIndex: 0 }}
      />

      {/* Placeholder 레이어 (placeholder prop에 따라 표시) */}
      {hasShowPlaceholder && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          style={placeholderStyle}
        />
      )}
    </div>
  );
}
