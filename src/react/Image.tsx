import { useState, type ImgHTMLAttributes, type CSSProperties } from "react";
import type { ResponsiveImageData } from "../types";

// ?vite-image import 결과 타입
interface BaseImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "width" | "height" | "src" | "srcSet"
  > {
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

export type ImageProps = FillImageProps | StandardImageProps;

export default function Image({
  imgData,
  src,
  srcSet,
  lqipSrc,
  width,
  height,
  fill = false,
  sizes = "100vw",
  className = "",
  style,
  ...props
}: ImageProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // 1. 데이터 병합: imgData가 있으면 그걸 쓰고, 없으면 개별 prop 사용
  const currentSrc = imgData?.src || src;
  const currentSrcSet = imgData?.srcSet || srcSet;
  const currentLqip = imgData?.lqipSrc || lqipSrc;
  const currentWidth = imgData?.width || width;
  const currentHeight = imgData?.height || height;

  if (!currentSrc) {
    console.warn("Image: 'src' or 'imgData' is required.");
    return null;
  }

  // 2. 컨테이너 스타일 계산
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

  // 3. 실제 이미지 스타일
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

  // 4. LQIP 스타일
  const lqipStyle: CSSProperties = {
    ...imgStyle,
    filter: "blur(20px)", // blur 효과 강화 (선택사항)
    transform: "scale(1.1)", // blur 경계선 숨기기
    transition: "opacity 500ms ease-out", // 부드러운 전환
    opacity: isImageLoaded ? 0 : 1,
    zIndex: 1, // 로딩 중에는 위에 표시
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
