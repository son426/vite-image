import { imagetools } from 'vite-imagetools';

// src/plugin/index.ts
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
      return null;
    }
  };
  return [viteImageMacro, imagetools(options)];
}

export { viteImage };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map