// @vitest-environment jsdom

import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { OptimizedImageData } from "../types";
import Image, { Image as NamedImage } from "./index";

const optimizedImage: OptimizedImageData = {
  src: "/hero-1280.jpg",
  width: 1280,
  height: 720,
  srcSet: "/hero-640.jpg 640w, /hero-1280.jpg 1280w",
  sources: [
    {
      type: "image/avif",
      srcSet: "/hero-640.avif 640w, /hero-1280.avif 1280w",
    },
    {
      type: "image/webp",
      srcSet: "/hero-640.webp 640w, /hero-1280.webp 1280w",
    },
  ],
  blurDataURL: "data:image/webp;base64,placeholder",
};

afterEach(cleanup);

describe("Image SSR", () => {
  it("React DOM preload API 없이 React 18 호환 마크업을 렌더링한다", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const markup = renderToStaticMarkup(
      <Image src={optimizedImage} alt="Hero" priority />,
    );
    const warnings = consoleError.mock.calls;
    consoleError.mockRestore();

    expect(warnings).toEqual([]);
    expect(markup).toContain('<span style="position:relative;display:inline-block');
    expect(markup).toContain('src="/hero-1280.jpg"');
    expect(markup).toContain('loading="eager"');
    expect(markup).toContain('fetchPriority="high"');
    expect(markup).toContain('decoding="async"');
  });

  it("blur placeholder의 초기 SSR 마크업이 결정적이다", () => {
    const first = renderToStaticMarkup(
      <Image src={optimizedImage} alt="Hero" placeholder="blur" />,
    );
    const second = renderToStaticMarkup(
      <Image src={optimizedImage} alt="Hero" placeholder="blur" />,
    );

    expect(first).toBe(second);
    expect(first).toContain('aria-hidden="true"');
    expect(first).toContain('role="presentation"');
    expect(first).toContain('opacity:1');
  });
});

describe("Image DOM semantics", () => {
  it("default와 named export가 같은 forwardRef 컴포넌트다", () => {
    expect(NamedImage).toBe(Image);
  });

  it("설정된 순서대로 source를 렌더링하고 모든 후보에 같은 sizes를 쓴다", () => {
    const { container, getByAltText } = render(
      <Image src={optimizedImage} alt="Hero" sizes="(max-width: 700px) 100vw, 700px" />,
    );

    const picture = container.querySelector("picture");
    const sources = [...(picture?.querySelectorAll("source") ?? [])];

    expect(picture).not.toBeNull();
    expect(sources.map((source) => source.getAttribute("type"))).toEqual([
      "image/avif",
      "image/webp",
    ]);
    expect(sources.map((source) => source.getAttribute("srcset"))).toEqual([
      optimizedImage.sources?.[0].srcSet,
      optimizedImage.sources?.[1].srcSet,
    ]);
    expect(sources.every((source) => source.getAttribute("sizes") === "(max-width: 700px) 100vw, 700px")).toBe(true);
    expect(getByAltText("Hero").getAttribute("srcset")).toBe(optimizedImage.srcSet);
  });

  it("standard optimized image의 기본 sizes와 intrinsic dimension을 사용한다", () => {
    const { getByAltText } = render(
      <Image src={optimizedImage} alt="Hero" />,
    );
    const image = getByAltText("Hero");

    expect(image.getAttribute("sizes")).toBe("1280px");
    expect(image.getAttribute("width")).toBe("1280");
    expect(image.getAttribute("height")).toBe("720");
    expect(image.getAttribute("loading")).toBe("lazy");
    expect(image.getAttribute("decoding")).toBe("async");
  });

  it("optimized dimension override를 실제 img 속성에 반영한다", () => {
    const { getByAltText } = render(
      <Image src={optimizedImage} alt="Hero" width={640} height={360} />,
    );

    expect(getByAltText("Hero").getAttribute("width")).toBe("640");
    expect(getByAltText("Hero").getAttribute("height")).toBe("360");
  });

  it("string URL의 native responsive props를 그대로 전달한다", () => {
    const { container, getByAltText } = render(
      <Image
        src="/raw.jpg"
        srcSet="/raw-320.jpg 320w, /raw-640.jpg 640w"
        sizes="50vw"
        width={640}
        height={360}
        alt="Raw"
        crossOrigin="anonymous"
        data-image-id="raw"
      />,
    );
    const image = getByAltText("Raw");

    expect(container.querySelector("picture")).toBeNull();
    expect(image.getAttribute("src")).toBe("/raw.jpg");
    expect(image.getAttribute("srcset")).toBe("/raw-320.jpg 320w, /raw-640.jpg 640w");
    expect(image.getAttribute("sizes")).toBe("50vw");
    expect(image.getAttribute("width")).toBe("640");
    expect(image.getAttribute("height")).toBe("360");
    expect(image.getAttribute("crossorigin")).toBe("anonymous");
    expect(image.getAttribute("data-image-id")).toBe("raw");
  });

  it("priority가 loading과 fetchPriority를 올리고 아니면 native 값을 존중한다", () => {
    const { getByAltText, rerender } = render(
      <Image
        src="/raw.jpg"
        alt="Raw"
        priority
        loading="lazy"
        fetchPriority="low"
      />,
    );

    expect(getByAltText("Raw").getAttribute("loading")).toBe("eager");
    expect(getByAltText("Raw").getAttribute("fetchpriority")).toBe("high");

    rerender(
      <Image
        src="/raw.jpg"
        alt="Raw"
        loading="eager"
        fetchPriority="low"
      />,
    );

    expect(getByAltText("Raw").getAttribute("loading")).toBe("eager");
    expect(getByAltText("Raw").getAttribute("fetchpriority")).toBe("low");
  });

  it("img와 wrapper의 className/style을 분리한다", () => {
    const { getByAltText } = render(
      <Image
        src="/raw.jpg"
        alt="Raw"
        className="image"
        style={{ objectFit: "contain", borderRadius: 8 }}
        wrapperClassName="frame"
        wrapperStyle={{ backgroundColor: "red" }}
      />,
    );
    const image = getByAltText("Raw");
    const wrapper = image.closest("span");

    expect(image.classList.contains("image")).toBe(true);
    expect(image.style.objectFit).toBe("contain");
    expect(image.style.borderRadius).toBe("8px");
    expect(wrapper?.classList.contains("frame")).toBe(true);
    expect(wrapper?.style.backgroundColor).toBe("red");
    expect(wrapper?.classList.contains("image")).toBe(false);
    expect(image.style.position).toBe("");
  });

  it("fill은 wrapper와 img 레이아웃만 설정하고 dimension 속성은 생략한다", () => {
    const { getByAltText } = render(
      <Image
        src={optimizedImage}
        alt="Hero"
        fill
        sizes="100vw"
        width={400}
        height={225}
        style={{ objectFit: "contain" }}
      />,
    );
    const image = getByAltText("Hero");
    const wrapper = image.closest("span");

    expect(image.hasAttribute("width")).toBe(false);
    expect(image.hasAttribute("height")).toBe(false);
    expect(image.style.position).toBe("absolute");
    expect(image.style.inset).toBe("0px");
    expect(image.style.width).toBe("100%");
    expect(image.style.height).toBe("100%");
    expect(image.style.objectFit).toBe("contain");
    expect(wrapper?.style.position).toBe("absolute");
    expect(wrapper?.style.inset).toBe("0px");
    expect(wrapper?.style.overflow).toBe("hidden");
  });

  it("load/error 뒤 blur overlay를 숨기고 src 변경 시 새 placeholder를 보인다", () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    const { container, getByAltText, rerender } = render(
      <Image
        src={optimizedImage}
        alt="Hero"
        placeholder="blur"
        onLoad={onLoad}
        onError={onError}
      />,
    );
    const getOverlay = () => container.querySelector<HTMLImageElement>('img[aria-hidden="true"]');

    expect(getOverlay()?.style.opacity).toBe("1");
    fireEvent.load(getByAltText("Hero"));
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(getOverlay()?.style.opacity).toBe("0");

    const nextImage = { ...optimizedImage, src: "/next.jpg" };
    rerender(
      <Image
        src={nextImage}
        alt="Next"
        placeholder="blur"
        onLoad={onLoad}
        onError={onError}
      />,
    );
    expect(getOverlay()?.style.opacity).toBe("1");

    fireEvent.error(getByAltText("Next"));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(getOverlay()?.style.opacity).toBe("0");
  });

  it("forwarded ref와 native handlers가 실제 img를 가리킨다", () => {
    const ref = createRef<HTMLImageElement>();
    const { getByAltText } = render(
      <Image ref={ref} src="/raw.jpg" alt="Raw" />,
    );

    expect(ref.current).toBe(getByAltText("Raw"));
    expect(ref.current?.tagName).toBe("IMG");
  });

  it("blur 데이터가 없으면 명확한 runtime error를 던진다", () => {
    const withoutBlur = { ...optimizedImage, blurDataURL: undefined };

    expect(() =>
      render(<Image src={withoutBlur} alt="Hero" placeholder="blur" />),
    ).toThrow(
      '[vite-image] placeholder="blur" requires a blurDataURL prop or optimized image metadata',
    );
  });
});
