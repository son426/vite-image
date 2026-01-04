import { useState } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/react/Image.tsx
function Image({
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
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const currentSrc = imgData?.src || src;
  const currentSrcSet = imgData?.srcSet || srcSet;
  const currentLqip = imgData?.lqipSrc || lqipSrc;
  const currentWidth = imgData?.width || width;
  const currentHeight = imgData?.height || height;
  if (!currentSrc) {
    console.warn("Image: 'src' or 'imgData' is required.");
    return null;
  }
  const containerStyle = fill ? {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden"
  } : {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    // Standard 모드일 때 aspect-ratio 처리
    ...currentWidth && currentHeight ? { aspectRatio: `${currentWidth} / ${currentHeight}` } : {}
  };
  const mergedContainerStyle = { ...containerStyle, ...style };
  const imgStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover"
  };
  const lqipStyle = {
    ...imgStyle,
    filter: "blur(20px)",
    // blur 효과 강화 (선택사항)
    transform: "scale(1.1)",
    // blur 경계선 숨기기
    transition: "opacity 500ms ease-out",
    // 부드러운 전환
    opacity: isImageLoaded ? 0 : 1,
    zIndex: 1
    // 로딩 중에는 위에 표시
  };
  return /* @__PURE__ */ jsxs("div", { className, style: mergedContainerStyle, children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        ...props,
        src: currentSrc,
        srcSet: currentSrcSet,
        sizes,
        width: fill ? void 0 : currentWidth,
        height: fill ? void 0 : currentHeight,
        onLoad: () => setIsImageLoaded(true),
        style: { ...imgStyle, zIndex: 0 }
      }
    ),
    currentLqip && /* @__PURE__ */ jsx("img", { src: currentLqip, alt: "", "aria-hidden": "true", style: lqipStyle })
  ] });
}

export { Image as default };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map