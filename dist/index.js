import 'react';
import 'react-dom';
import 'react/jsx-runtime';
import { imagetools } from 'vite-imagetools';
import { createFilter } from '@rollup/pluginutils';

// src/react/Image.tsx
var DEFAULT_BREAKPOINTS = [640, 1024, 1920];
function getFileExtension(id) {
  const [basePath] = id.split("?");
  const match = basePath.match(/\.([^.]+)$/);
  return match ? `.${match[1]}` : null;
}
function matchesExtension(id, extensions) {
  if (!extensions || extensions.length === 0) return false;
  const ext = getFileExtension(id);
  if (!ext) return false;
  return extensions.includes(ext);
}
function generateSrcSetParams(breakpoints, quality) {
  const qualityParam = quality ? `&quality=${quality}` : "";
  return `w=${breakpoints.join(";")}&format=webp${qualityParam}&as=srcset`;
}
function generateMetaParams(breakpoints, quality) {
  const maxWidth = Math.max(...breakpoints);
  const qualityParam = quality ? `&quality=${quality}` : "";
  return `w=${maxWidth}&format=webp${qualityParam}&as=meta`;
}
function generateImageCode(basePath, breakpoints, quality) {
  const srcSetParams = generateSrcSetParams(breakpoints, quality);
  const metaParams = generateMetaParams(breakpoints, quality);
  const blurQuality = quality ?? 20;
  const lqipParams = `w=20&blur=2&quality=${blurQuality}&format=webp&inline`;
  return `
    import meta from "${basePath}?${metaParams}";
    import srcSet from "${basePath}?${srcSetParams}";
    import blurDataURL from "${basePath}?${lqipParams}";
    
    export default {
      src: meta.src,
      width: meta.width,
      height: meta.height,
      srcSet: srcSet,
      blurDataURL: blurDataURL
    };
  `;
}
function shouldAutoApply(id, autoApply, filter) {
  if (!autoApply) return false;
  if (!autoApply.extensions || autoApply.extensions.length === 0) {
    return false;
  }
  if (!matchesExtension(id, autoApply.extensions)) {
    return false;
  }
  if (filter && !filter(id)) {
    return false;
  }
  return true;
}
function viteImage(config) {
  const breakpoints = config?.breakpoints ?? DEFAULT_BREAKPOINTS;
  const autoApply = config?.autoApply;
  const imagetoolsOptions = config?.imagetools;
  const filter = autoApply ? createFilter(autoApply.include, autoApply.exclude) : null;
  const viteImageMacro = {
    name: "vite-plugin-vite-image-macro",
    enforce: "pre",
    async load(id) {
      const [basePath, search] = id.split("?");
      const params = new URLSearchParams(search);
      if (params.has("vite-image")) {
        const quality = params.get("quality") ? parseInt(params.get("quality"), 10) : void 0;
        return generateImageCode(basePath, breakpoints, quality);
      }
      if (shouldAutoApply(id, autoApply, filter)) {
        return generateImageCode(basePath, breakpoints);
      }
      return null;
    }
  };
  return [viteImageMacro, imagetools(imagetoolsOptions)];
}

export { viteImage };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map