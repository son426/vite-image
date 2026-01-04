import { useState } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/react/Image.tsx
function Image({
  src,
  // 이제 이 src는 객체입니다.
  fill = false,
  sizes = "100vw",
  className = "",
  style,
  ...props
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const {
    src: currentSrc,
    srcSet: currentSrcSet,
    lqipSrc: currentLqip,
    width: currentWidth,
    height: currentHeight
  } = src;
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
    transform: "scale(1.1)",
    transition: "opacity 500ms ease-out",
    opacity: isImageLoaded ? 0 : 1,
    zIndex: 1
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