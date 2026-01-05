import { useState } from 'react';
import { preload } from 'react-dom';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/react/Image.tsx
function generateSizesFromSrcSet(srcSet) {
  if (!srcSet) {
    return "100vw";
  }
  const widthMatches = srcSet.match(/(\d+)w/g);
  if (!widthMatches || widthMatches.length === 0) {
    return "100vw";
  }
  const breakpoints = widthMatches.map((match) => parseInt(match.replace("w", ""), 10)).sort((a, b) => a - b);
  if (breakpoints.length === 0) {
    return "100vw";
  }
  const sizeParts = [];
  for (let i = 0; i < breakpoints.length; i++) {
    const breakpoint = breakpoints[i];
    if (i === breakpoints.length - 1) {
      sizeParts.push(`${breakpoint}px`);
    } else {
      sizeParts.push(`(max-width: ${breakpoint}px) 100vw`);
    }
  }
  return sizeParts.join(", ");
}
function Image({
  src,
  // 이제 이 src는 객체입니다.
  fill = false,
  sizes,
  placeholder = "empty",
  // 기본값: empty (Next.js Image 호환)
  blurDataURL: customBlurDataURL,
  // 사용자가 직접 제공한 blurDataURL (우선순위 높음)
  loading,
  // loading prop (priority보다 낮은 우선순위)
  priority = false,
  // 기본값: false (Next.js Image 호환)
  className = "",
  style,
  onLoad,
  onError,
  ...props
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const {
    src: currentSrc,
    srcSet: currentSrcSet,
    blurDataURL: srcBlurDataURL,
    // 번들러가 생성한 blurDataURL
    width: currentWidth,
    height: currentHeight
  } = src;
  const blurDataURL = customBlurDataURL ?? srcBlurDataURL;
  const loadingAttr = priority ? "eager" : loading ?? "lazy";
  const computedSizes = sizes ?? (fill ? "100vw" : generateSizesFromSrcSet(currentSrcSet));
  if (priority && currentSrc) {
    preload(currentSrc, {
      as: "image",
      fetchPriority: "high",
      ...currentSrcSet ? { imageSrcSet: currentSrcSet } : {},
      ...computedSizes ? { imageSizes: computedSizes } : {}
    });
  }
  const getPlaceholderSrc = () => {
    if (placeholder === "empty") {
      return void 0;
    }
    if (placeholder === "blur") {
      return blurDataURL;
    }
    if (placeholder.startsWith("data:image/")) {
      return placeholder;
    }
    return void 0;
  };
  const placeholderSrc = getPlaceholderSrc();
  const hasShowPlaceholder = !!placeholderSrc;
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
  const placeholderStyle = {
    ...imgStyle,
    transition: "opacity 500ms ease-out",
    opacity: isImageLoaded ? 0 : 1,
    zIndex: 1,
    pointerEvents: "none",
    // blur placeholder일 때만 blur 효과 적용
    ...placeholder === "blur" ? {
      filter: "blur(20px)",
      transform: "scale(1.1)"
    } : {}
  };
  return /* @__PURE__ */ jsxs("div", { className, style: mergedContainerStyle, children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        ...props,
        src: currentSrc,
        srcSet: currentSrcSet,
        sizes: computedSizes,
        width: fill ? void 0 : currentWidth,
        height: fill ? void 0 : currentHeight,
        loading: loadingAttr,
        fetchPriority: priority ? "high" : void 0,
        onLoad: (e) => {
          setIsImageLoaded(true);
          onLoad?.(e);
        },
        onError,
        style: { ...imgStyle, zIndex: 0 }
      }
    ),
    hasShowPlaceholder && /* @__PURE__ */ jsx(
      "img",
      {
        src: placeholderSrc,
        alt: "",
        "aria-hidden": "true",
        style: placeholderStyle
      }
    )
  ] });
}

export { Image as default };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map