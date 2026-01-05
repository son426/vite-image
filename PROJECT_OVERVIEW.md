# @son426/vite-image 프로젝트 개요 및 인수인계 문서

## 프로젝트 개요

**@son426/vite-image**는 Vite + React 환경에서 Next.js의 `<Image />` 컴포넌트와 유사한 경험을 제공하는 이미지 최적화 라이브러리입니다. `vite-imagetools`를 기반으로 하여 빌드 타임에 이미지를 최적화하고, React 컴포넌트로 사용할 수 있게 해줍니다.

### 핵심 목표

- Next.js Image 컴포넌트와 유사한 API 제공
- 빌드 타임 이미지 최적화 (포맷 변환, 리사이징, 압축)
- 자동 LQIP (Low Quality Image Placeholder) 생성
- 반응형 이미지 지원 (srcSet 자동 생성)
- TypeScript 완전 지원

---

## 프로젝트 구조

```
vite-image/
├── src/
│   ├── index.ts              # 메인 엔트리 포인트 (react, plugin re-export)
│   ├── types.ts               # 공통 타입 정의 (ResponsiveImageData)
│   ├── plugin/
│   │   └── index.ts           # Vite 플러그인 (viteImage 함수)
│   └── react/
│       ├── index.ts           # React 컴포넌트 export
│       └── Image.tsx          # Image 컴포넌트 구현
├── dist/                      # 빌드 결과물 (tsup으로 생성)
├── package.json
├── tsconfig.json
├── tsup.config.ts             # 빌드 설정
└── README.md
```

### 주요 파일 역할

#### 1. `src/plugin/index.ts` - Vite 플러그인

- **역할**: `?vite-image` 쿼리 파라미터를 감지하고 이미지 최적화 처리
- **핵심 기능**:
  - `viteImage()` 함수로 플러그인 생성
  - `?vite-image` 쿼리가 있는 import를 감지
  - `vite-imagetools`를 사용하여 3가지 버전의 이미지 생성:
    1. **srcSet**: 반응형 이미지 세트 (640px, 1024px, 1920px)
    2. **meta**: 메인 이미지 메타데이터 (1920px)
    3. **blurDataURL**: LQIP용 작은 이미지 (20px, blur, inline base64)
  - 이들을 조합하여 `ResponsiveImageData` 객체 반환

**현재 하드코딩된 값들** (향후 config로 이동 예정):

- Breakpoints: `640, 1024, 1920`
- Format: `webp` (고정)
- Meta width: `1920`
- LQIP: `w=20&blur=2&quality=20&format=webp&inline`

#### 2. `src/react/Image.tsx` - React 컴포넌트

- **역할**: 최적화된 이미지를 표시하는 React 컴포넌트
- **핵심 기능**:
  - `ResponsiveImageData` 객체를 받아서 이미지 렌더링
  - 자동 `sizes` 계산 (srcSet breakpoints 기반)
  - Placeholder 지원 (`empty`, `blur`, `data:image/...`)
  - Priority loading (`react-dom`의 `preload` API 사용, html loading, fetchPriority 활용)
  - Fill 모드 지원 (컨테이너 채우기)
  - loading=lazy 기본값, priority 시 loading=eager

**주요 Props**:

- `src`: `ResponsiveImageData` 객체 (필수)
- `fill`: boolean (컨테이너 채우기 모드)
- `sizes`: string (자동 계산 가능)
- `placeholder`: `'empty' | 'blur' | 'data:image/...'`
- `blurDataURL`: string (커스텀 placeholder, src.blurDataURL보다 우선)
- `priority`: boolean (높은 우선순위 로딩)
- `onLoad`, `onError`: 이벤트 핸들러

#### 3. `src/types.ts` - 타입 정의

- **ResponsiveImageData**: `?vite-image` 쿼리 결과 타입
  ```typescript
  {
    src: string;           // 최적화된 이미지 URL
    width: number;         // 이미지 너비
    height: number;        // 이미지 높이
    srcSet?: string;       // 반응형 srcSet 문자열
    blurDataURL?: string;  // Base64 인코딩된 blur placeholder
  }
  ```

---

## 현재 구현된 기능

### 1. 이미지 최적화 (빌드 타임)

- ✅ `?vite-image` 쿼리로 이미지 import 시 자동 최적화
- ✅ WebP 포맷 변환 (현재 고정)
- ✅ 반응형 srcSet 생성 (640px, 1024px, 1920px)
- ✅ LQIP 자동 생성 (20px, blur, inline base64)

### 2. React 컴포넌트 기능

- ✅ Next.js Image와 유사한 API
- ✅ `fill` 모드 (컨테이너 채우기)
- ✅ 자동 `sizes` 계산 (srcSet breakpoints 기반)
- ✅ Placeholder 지원:
  - `empty`: 플레이스홀더 없음
  - `blur`: blurDataURL 사용
  - `data:image/...`: 커스텀 data URL
- ✅ `priority` prop (preload + eager + fetchPriority high)
- ✅ `blurDataURL` prop (커스텀 placeholder, 번들러 생성값보다 우선)
- ✅ `onLoad`, `onError` 이벤트 핸들러
- ✅ Lazy loading 기본값

### 3. 타입 안정성

- ✅ 완전한 TypeScript 지원
- ✅ `PlaceholderValue` 타입 (엄격한 타입 체크)
- ✅ `ImageProps` 타입 (fill 모드 분기)

---

## 사용 패턴

### 기본 사용법

```tsx
// 1. Vite 설정
import { viteImage } from "@son426/vite-image/plugin";
export default defineConfig({
  plugins: [viteImage()],
});

// 2. 이미지 import (query string 필수)
import heroImage from "./hero.jpg?vite-image";

// 3. 컴포넌트 사용
import Image from "@son426/vite-image/react";
<Image src={heroImage} alt="Hero" />;
```

### 고급 사용법

```tsx
// Fill 모드
<div style={{ position: 'relative', height: '400px' }}>
  <Image src={image} fill alt="Background" />
</div>

// Priority (LCP 이미지)
<Image src={heroImage} alt="Hero" priority />

// Blur placeholder
<Image src={heroImage} alt="Hero" placeholder="blur" />

// 커스텀 blurDataURL
<Image
  src={heroImage}
  alt="Hero"
  blurDataURL="data:image/jpeg;base64,..."
  placeholder="blur"
/>
```

---

## 아키텍처 및 동작 원리

### 빌드 타임 처리 흐름

1. **사용자가 이미지 import**

   ```tsx
   import image from "./hero.jpg?vite-image";
   ```

2. **플러그인이 쿼리 감지**

   - `viteImageMacro` 플러그인이 `?vite-image` 쿼리 감지
   - `enforce: "pre"`로 다른 플러그인보다 먼저 실행

3. **이미지 최적화 요청 생성**

   - `vite-imagetools`에 3가지 요청:
     - `w=640;1024;1920&format=webp&as=srcset` → srcSet
     - `w=1920&format=webp&as=meta` → 메타데이터
     - `w=20&blur=2&quality=20&format=webp&inline` → blurDataURL

4. **결과 조합**

   - 3가지 결과를 `ResponsiveImageData` 객체로 조합
   - JavaScript 코드로 변환하여 반환

5. **런타임 사용**
   - React 컴포넌트가 `ResponsiveImageData` 객체를 받아서 렌더링

### 런타임 렌더링 흐름

1. **컴포넌트 초기화**

   - `src` 객체에서 데이터 추출
   - `blurDataURL` 우선순위: prop > src 객체

2. **sizes 자동 계산**

   - `sizes` prop이 없으면 `generateSizesFromSrcSet()` 실행
   - srcSet breakpoints를 파싱하여 미디어 쿼리 생성

3. **Priority 처리**

   - `priority={true}`일 때:
     - `react-dom`의 `preload()` API 호출
     - `loading="eager"`, `fetchPriority="high"` 설정

4. **Placeholder 처리**

   - `placeholder="blur"`: blurDataURL 사용
   - `placeholder="empty"`: 플레이스홀더 없음
   - `placeholder="data:image/..."`: 직접 제공된 data URL

5. **이미지 렌더링**
   - 실제 이미지와 placeholder 레이어 분리
   - 이미지 로드 완료 시 placeholder 페이드아웃

---

## 현재 제한사항 및 개선 필요 사항

### 1. 하드코딩된 설정값들

**위치**: `src/plugin/index.ts`

- Breakpoints: `640, 1024, 1920` (고정)
- Format: `webp` (고정)
- Meta width: `1920` (고정)
- LQIP 설정: `w=20&blur=2&quality=20` (고정)

**개선 방향**: Config 시스템으로 사용자가 커스터마이징 가능하게

### 2. Query String 필수

**현재**: `?vite-image` 쿼리를 반드시 붙여야 함

```tsx
import image from "./hero.jpg?vite-image"; // 필수
```

**개선 방향**:

- 자동 적용 모드 (특정 확장자 자동 처리)
- Query string 커스터마이징 옵션

### 3. Next.js Image 호환성

**아직 구현 안 된 Props**:

- `loading` prop (현재 priority에 묶여있음)
- `onLoadingComplete` 콜백
- `objectFit`, `objectPosition` (현재 `cover` 고정)
- `quality` prop (컴포넌트 레벨)
- `unoptimized` prop

---

## 향후 구현 계획

### 1. Config 시스템 구현

**목표**: 사용자가 플러그인 설정으로 커스터마이징 가능하게

**구현할 Config 옵션**:

```typescript
interface ViteImageConfig {
  // 이미지 최적화
  breakpoints?: number[]; // 기본값: [640, 1024, 1920]
  defaultFormat?: "webp" | "avif" | "jpg" | "png";
  formats?: ("webp" | "avif")[]; // 다중 포맷 지원
  metaWidth?: number; // 기본값: 1920
  quality?: number; // 기본값: 75

  // LQIP 설정
  lqip?: {
    enabled?: boolean;
    width?: number;
    blur?: number;
    quality?: number;
    format?: "webp" | "jpg" | "png";
  };

  // 자동 적용 모드
  autoApply?: {
    enabled: boolean;
    extensions?: string[]; // ['jpg', 'png', 'webp']
    include?: string[]; // 경로 패턴
    exclude?: string[];
  };

  // Query string 커스터마이징
  queryParam?: string; // 기본값: 'vite-image'
}
```

**구현 위치**: `src/plugin/index.ts`의 `viteImage()` 함수

### 2. 자동 적용 모드

**목표**: Query string 없이도 자동으로 이미지 최적화

**구현 방식**:

- `autoApply.enabled: true`일 때
- 지정된 확장자의 이미지 import를 자동 감지
- `?vite-image` 쿼리를 자동으로 추가하여 처리

**주의사항**:

- 모든 이미지가 자동 처리되면 의도치 않은 최적화 가능
- `include`/`exclude` 옵션으로 제어 필요

### 3. Next.js Image 추가 Props

**구현할 Props**:

- `loading`: `'lazy' | 'eager'` (현재 priority에 묶여있음)
- `onLoadingComplete`: 로딩 완료 콜백 (naturalWidth, naturalHeight 포함)
- `objectFit`: CSS object-fit 값
- `objectPosition`: CSS object-position 값

---

## 기술 스택 및 의존성

### 핵심 의존성

- **vite-imagetools**: 이미지 최적화 엔진 (Sharp 기반)
- **react**: React 컴포넌트
- **react-dom**: `preload` API 사용

### 빌드 도구

- **tsup**: TypeScript 빌드 (ESM 출력)
- **TypeScript**: 타입 체크 및 컴파일

### Peer Dependencies

- `react >= 18.0.0`
- `react-dom >= 18.0.0`
- `vite >= 4.0.0`

---

## 주요 설계 결정사항

### 1. Query String 기반 접근

**이유**:

- 명시적 제어 가능
- 다른 vite-imagetools 쿼리와 충돌 방지
- 사용자가 원하는 이미지만 선택적으로 최적화

**단점**:

- 사용 편의성 저하 (항상 `?vite-image` 붙여야 함)

**향후**: 자동 적용 모드를 옵션으로 제공하여 균형 맞춤

### 2. ResponsiveImageData 객체 구조

**이유**:

- 타입 안정성
- 명확한 API
- Next.js Image와 유사한 패턴

**특징**:

- `src` prop은 객체만 받음 (문자열 URL 불가)
- 빌드 타임에 모든 메타데이터 생성

### 3. sizes 자동 계산

**이유**:

- 사용자 편의성
- srcSet breakpoints와 일치하는 sizes 생성

**로직**:

- srcSet에서 breakpoints 추출
- 미디어 쿼리 문자열 생성
- `fill` 모드일 때는 `"100vw"` 사용

### 4. blurDataURL 우선순위

**우선순위**: prop > src 객체
**이유**:

- 동적 이미지 지원
- 커스텀 placeholder 허용
- Next.js Image 호환성

---

## 코드 구조 상세

### 플러그인 로직 (`src/plugin/index.ts`)

```typescript
export function viteImage(options?: ViteImagePluginOptions) {
  const viteImageMacro: PluginOption = {
    name: "vite-plugin-vite-image-macro",
    enforce: "pre", // 다른 플러그인보다 먼저 실행
    async load(id: string) {
      // 1. 쿼리 파라미터 파싱
      const [basePath, search] = id.split("?");
      const params = new URLSearchParams(search);

      // 2. ?vite-image 쿼리 감지
      if (params.has("vite-image")) {
        // 3. 이미지 최적화 파라미터 정의
        const srcSetParams = "w=640;1024;1920&format=webp&as=srcset";
        const metaParams = "w=1920&format=webp&as=meta";
        const lqipParams = "w=20&blur=2&quality=20&format=webp&inline";

        // 4. JavaScript 코드 생성 (import 문들)
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
    },
  };

  return [viteImageMacro, imagetools(options)];
}
```

**핵심 포인트**:

- `load()` 훅에서 쿼리 감지
- 동적으로 import 문 생성
- `vite-imagetools`가 실제 이미지 처리

### 컴포넌트 로직 (`src/react/Image.tsx`)

**주요 함수들**:

1. **`generateSizesFromSrcSet()`**

   - srcSet 문자열 파싱
   - Breakpoints 추출 및 정렬
   - 미디어 쿼리 문자열 생성

2. **`getPlaceholderSrc()`**

   - placeholder prop에 따라 적절한 src 반환
   - `blur` → blurDataURL
   - `empty` → undefined
   - `data:image/...` → 직접 사용

3. **Priority 처리**

   - `react-dom`의 `preload()` API 사용
   - srcSet과 sizes도 함께 preload

4. **렌더링 구조**
   - 컨테이너 div (fill 모드에 따라 스타일 변경)
   - 실제 이미지 img
   - Placeholder 이미지 img (조건부)

---

## 테스트 및 검증 포인트

### 플러그인 테스트

- [ ] `?vite-image` 쿼리 감지 확인
- [ ] 이미지 최적화 결과 확인
- [ ] ResponsiveImageData 구조 확인
- [ ] Config 옵션 적용 확인 (향후)

### 컴포넌트 테스트

- [ ] 기본 렌더링
- [ ] Fill 모드 동작
- [ ] Priority 로딩
- [ ] Placeholder 표시
- [ ] sizes 자동 계산
- [ ] onLoad/onError 이벤트

---

## 알려진 이슈 및 주의사항

### 1. vite-imagetools 의존성

- Sharp 기반이므로 Node.js 환경 필요
- 빌드 타임에만 동작 (런타임 최적화 아님)

### 2. 이미지 포맷 제한

- 현재 WebP 고정
- AVIF 지원 예정 (config로 추가 가능하게)

---

## 참고 자료

### 관련 라이브러리

- **vite-imagetools**: https://github.com/JonasKruckenberg/imagetools
- **Next.js Image**: https://nextjs.org/docs/pages/api-reference/components/image

### 문서

- README.md: 사용자 가이드
- 이 문서: 개발자 인수인계 문서

---

## 다음 작업 우선순위

1. **Config 시스템 구현** (최우선)

   - breakpoints, format, quality 등 설정 가능하게
   - 플러그인 옵션으로 전달

2. **자동 적용 모드**

   - Query string 없이도 동작
   - Extension 기반 필터링

3. **Next.js Image 추가 Props**

   - `loading`, `onLoadingComplete`
   - `objectFit`, `objectPosition`

4. **AVIF 포맷 지원**
   - Config로 포맷 선택 가능하게
   - 다중 포맷 지원 (picture 요소)

---

## 문의 및 지원

프로젝트 관련 질문이나 이슈는 프로젝트 저장소를 통해 문의해주세요.
