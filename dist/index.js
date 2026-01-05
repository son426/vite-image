import 'react';
import 'react/jsx-runtime';
import { imagetools } from 'vite-imagetools';

// src/react/Image.tsx
function viteImage(options) {
  const viteImageMacro = {
    name: "vite-plugin-vite-image-macro",
    enforce: "pre",
    async load(id) {
      const [basePath, search] = id.split("?");
      const params = new URLSearchParams(search);
      if (params.has("vite-image")) {
        const srcSetParams = "w=640;1024;1920&format=webp&as=srcset";
        const metaParams = "w=1920&format=webp&as=meta";
        const lqipParams = "w=20&blur=2&quality=20&format=webp&inline";
        return `
          import srcSet from "${basePath}?${srcSetParams}";
          import meta from "${basePath}?${metaParams}";
          import lqipSrc from "${basePath}?${lqipParams}";
          
          export default {
            src: meta.src,
            width: meta.width,
            height: meta.height,
            srcSet: srcSet,
            lqipSrc: lqipSrc, // Deprecated: \uD558\uC704 \uD638\uD658\uC131\uC744 \uC704\uD574 \uC720\uC9C0
            blurDataURL: lqipSrc // Next.js Image \uD638\uD658\uC131\uC744 \uC704\uD55C blurDataURL
          };
        `;
      }
      return null;
    }
  };
  return [viteImageMacro, imagetools(options)];
}

export { viteImage };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map