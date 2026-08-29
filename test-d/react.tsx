import { createRef } from "react";

import Image, { Image as NamedImage, type ImageProps } from "../src/react";
import type { OptimizedImageData } from "../src/types";

const optimized: OptimizedImageData = {
  src: "/hero.jpg",
  width: 1280,
  height: 720,
  srcSet: "/hero-640.jpg 640w, /hero-1280.jpg 1280w",
  blurDataURL: "data:image/webp;base64,placeholder",
};

const ref = createRef<HTMLImageElement>();

<Image src={optimized} alt="Hero" />;
<Image src={optimized} alt="Hero" fill sizes="100vw" />;
<Image src={optimized} alt="Hero" placeholder="empty" />;
<Image src={optimized} alt="Hero" placeholder="blur" />;
<Image src={optimized} alt="Hero" placeholder="blur" blurDataURL="data:image/png;base64,custom" />;
<Image src={optimized} alt="Hero" width={640} height={360} />;
<Image
  ref={ref}
  src="/raw.jpg"
  alt="Raw"
  className="image"
  srcSet="/raw-320.jpg 320w, /raw-640.jpg 640w"
  sizes="50vw"
  width={640}
  height={360}
/>;
<NamedImage src="/raw.jpg" alt="Raw" />;

const props: ImageProps = { src: optimized, alt: "Hero" };
void props;

// @ts-expect-error fill images require an explicit sizes value.
<Image src={optimized} alt="Hero" fill />;

// @ts-expect-error fill applies the same sizes requirement to string URLs.
<Image src="/raw.jpg" alt="Raw" fill />;

// @ts-expect-error placeholders only apply to optimized image metadata.
<Image src="/raw.jpg" alt="Raw" placeholder="blur" />;

// @ts-expect-error blurDataURL only applies to optimized image metadata.
<Image src="/raw.jpg" alt="Raw" blurDataURL="data:image/png;base64,custom" />;

// @ts-expect-error alt is required for accessible images.
<Image src={optimized} />;
