# 빠른 설정 가이드 (only-coding 프로젝트용)

## 방법 1: 상대 경로 사용 (권장 - 권한 문제 없음)

이 방법이 가장 간단하고 권한 문제가 없습니다.

### 1단계: only-coding 프로젝트에 패키지 추가

```bash
cd /Users/son/dev/only-coding
pnpm add file:../vite-image
```

이렇게 하면 `package.json`에 다음과 같이 추가됩니다:

```json
{
  "dependencies": {
    "@son426/vite-image": "file:../vite-image"
  }
}
```

### 2단계: vite.config.ts 수정

`imagetools()` 대신 `viteImage()` 사용:

```typescript
import { viteImage } from "@son426/vite-image/plugin";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // imagetools() 제거하고
    viteImage(), // 이것으로 교체
    // ...
  ],
});
```

### 3단계: 개발 시작

```bash
# 터미널 1: 라이브러리 자동 빌드
cd /Users/son/dev/vite-image
pnpm run dev

# 터미널 2: only-coding 개발 서버
cd /Users/son/dev/only-coding
pnpm run dev
```

---

## 방법 2: pnpm link 사용 (권한 문제 해결 후)

### 권한 문제 해결

터미널에서 직접 실행:

```bash
# 1. 새 터미널 열기 (기존 터미널 닫고 새로 열기)
# 또는
source ~/.zshrc

# 2. pnpm 홈 디렉토리 권한 확인
ls -la ~/Library/pnpm

# 3. 권한이 없다면 수동으로 생성
mkdir -p ~/Library/pnpm
chmod 755 ~/Library/pnpm

# 4. 라이브러리 빌드 및 링크
cd /Users/son/dev/vite-image
pnpm run build
pnpm link --global
```

### only-coding에서 링크 연결

```bash
cd /Users/son/dev/only-coding
pnpm link --global @son426/vite-image
```

---

## 개발 워크플로우

### 일상적인 개발

```bash
# 터미널 1: 라이브러리 자동 빌드
cd /Users/son/dev/vite-image
pnpm run dev  # watch 모드

# 터미널 2: only-coding 개발 서버
cd /Users/son/dev/only-coding
pnpm run dev
```

**작업 순서**:

1. `vite-image/src/`에서 코드 수정
2. 자동으로 `dist/` 빌드됨
3. `only-coding`에서 변경사항 즉시 확인 (Vite 핫 리로드)

### 변경사항이 반영 안 될 때

```bash
# only-coding 프로젝트에서
cd /Users/son/dev/only-coding

# Vite 캐시 클리어
rm -rf node_modules/.vite
pnpm run dev
```

---

## test 페이지에서 사용하기

`src/pages/test/index.tsx`에서:

```typescript
import { Image } from "@son426/vite-image/react";
// 기존 CustomImage import 제거

export default function TestPage() {
  return (
    <div className="max-w-4xl mx-auto p-10">
      <section>
        <h1>라이브러리 Image 컴포넌트</h1>
        <Image
          src={imageMeta.src}
          srcSet={imageSrcSet}
          lqipSrc={imageLqipSrc}
          width={imageMeta.width}
          height={imageMeta.height}
          fill={false}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
          className="w-full h-full"
          alt="MacOS Background"
        />
      </section>
    </div>
  );
}
```

---

## 체크리스트

- [ ] `only-coding`에 패키지 추가 (`pnpm add file:../vite-image`)
- [ ] `vite.config.ts`에서 `viteImage()` 플러그인 사용
- [ ] `test/index.tsx`에서 `Image` 컴포넌트 import 및 사용
- [ ] 라이브러리 watch 모드 실행 (`pnpm run dev`)
- [ ] only-coding 개발 서버 실행 (`pnpm run dev`)
- [ ] 브라우저에서 테스트 확인
