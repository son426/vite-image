import { useState, type ImgHTMLAttributes, type CSSProperties } from "react";
import type { ResponsiveImageData } from "../types";

// ?vite-image import 결과 타입
interface BaseImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "srcSet" | "width" | "height"
  > {
  // 핵심 변경: src는 무조건 최적화된 이미지 객체만 받음
  src: ResponsiveImageData;
  sizes?: string;
}

interface FillImageProps extends BaseImageProps {
  fill: true;
}

interface StandardImageProps extends BaseImageProps {
  fill?: false | undefined;
}

export type ImageProps = FillImageProps | StandardImageProps;

export default function Image({
  src, // 이제 이 src는 객체입니다.
  fill = false,
  sizes = "100vw",
  className = "",
  style,
  ...props
}: ImageProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // 1. 데이터 추출: src 객체에서 바로 꺼내씀 (병합 로직 제거)
  const {
    src: currentSrc,
    srcSet: currentSrcSet,
    lqipSrc: currentLqip,
    width: currentWidth,
    height: currentHeight,
  } = src;

  // 2. 컨테이너 스타일 계산 (기존 로직 유지)
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

  // 3. 실제 이미지 스타일 (기존 로직 유지)
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

  // 4. LQIP 스타일 (기존 로직 유지)
  const lqipStyle: CSSProperties = {
    ...imgStyle,
    filter: "blur(20px)",
    transform: "scale(1.1)",
    transition: "opacity 500ms ease-out",
    opacity: isImageLoaded ? 0 : 1,
    zIndex: 1,
  };

  return (
    <div className={className} style={mergedContainerStyle}>
      {/* 실제 이미지 */}
      <img
        {...props}
        src={currentSrc}
        srcSet={currentSrcSet}
        sizes={sizes}
        width={fill ? undefined : currentWidth}
        height={fill ? undefined : currentHeight}
        onLoad={() => setIsImageLoaded(true)}
        style={{ ...imgStyle, zIndex: 0 }}
      />

      {/* LQIP 레이어 */}
      {currentLqip && (
        <img src={currentLqip} alt="" aria-hidden="true" style={lqipStyle} />
      )}
    </div>
  );
}
