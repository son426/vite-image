# 로컬 개발 가이드 (pnpm link 사용)

이 가이드는 `/dev/vite-image`에서 라이브러리를 개발하면서 `/dev`의 다른 프로젝트에서 실시간으로 테스트하는 방법을 설명합니다.

## 🎯 워크플로우 개요

```
1. /dev/vite-image에서 라이브러리 개발
   ↓
2. pnpm link로 로컬 패키지로 등록
   ↓
3. /dev/다른프로젝트에서 링크된 패키지 사용
   ↓
4. 실시간 테스트 및 수정
   ↓
5. 픽스되면 npm publish로 배포
```

## 📋 방법 1: pnpm link (추천)

### 초기 설정 (최초 1회)

#### 1단계: 라이브러리 프로젝트에서 글로벌 링크 등록

```bash
# /dev/vite-image 디렉토리에서
cd /Users/son/dev/vite-image

# 빌드 (dist 폴더 생성 필요)
pnpm run build

# 글로벌 링크로 등록
pnpm link --global
# 또는 짧게
pnpm link -g
```

이 명령어는 `~/.local/share/pnpm/global/node_modules/@son426/vite-image`에 심볼릭 링크를 생성합니다.

#### 2단계: 사용할 프로젝트에서 링크 연결

```bash
# 예: /dev/malang-deploy 프로젝트에서
cd /Users/son/dev/malang-deploy

# 링크된 패키지 사용
pnpm link --global @son426/vite-image
# 또는 짧게
pnpm link -g @son426/vite-image
```

이제 `malang-deploy` 프로젝트는 npm에서 설치한 것이 아니라 로컬의 `vite-image`를 사용합니다.

### 개발 워크플로우

#### 개발 중 작업 흐름

```bash
# 터미널 1: 라이브러리 프로젝트 (자동 빌드)
cd /Users/son/dev/vite-image
pnpm run dev  # watch 모드로 자동 빌드

# 터미널 2: 실제 사용 프로젝트
cd /Users/son/dev/malang-deploy
pnpm run dev  # 개발 서버 실행
```

**작업 순서**:
1. `vite-image`에서 코드 수정 (`src/` 폴더)
2. `pnpm run dev`가 자동으로 `dist/` 빌드
3. `malang-deploy`에서 변경사항 즉시 반영 (Vite가 자동 감지)

### 링크 해제 (필요시)

```bash
# 사용 프로젝트에서 링크 해제
cd /Users/son/dev/malang-deploy
pnpm unlink @son426/vite-image

# 다시 npm 버전 사용하려면
pnpm install @son426/vite-image@latest
```

---

## 📋 방법 2: 상대 경로 직접 사용 (더 간단)

이 방법은 `package.json`에서 직접 상대 경로를 지정합니다.

### 설정 방법

#### 사용할 프로젝트의 `package.json` 수정

```json
{
  "dependencies": {
    "@son426/vite-image": "file:../vite-image"
  }
}
```

또는 pnpm 명령어로:

```bash
cd /Users/son/dev/malang-deploy
pnpm add file:../vite-image
```

### 장단점

**장점**:
- 링크 등록/해제 불필요
- 더 직관적
- 프로젝트별로 다른 버전 사용 가능

**단점**:
- `package.json`이 수정됨
- Git에 커밋하면 안 됨 (`.gitignore`에 추가 필요)

### 개발 워크플로우

```bash
# 터미널 1: 라이브러리 자동 빌드
cd /Users/son/dev/vite-image
pnpm run dev

# 터미널 2: 사용 프로젝트
cd /Users/son/dev/malang-deploy
pnpm run dev
```

**주의**: 라이브러리 코드 수정 후 `dist/`가 빌드되면, 사용 프로젝트에서 Vite가 자동으로 감지합니다.

---

## 🔄 실제 개발 시나리오

### 시나리오: Image 컴포넌트에 새 prop 추가

#### 1. 라이브러리 코드 수정

```bash
# /dev/vite-image에서
# src/react/Image.tsx 파일 수정
```

```typescript
// src/react/Image.tsx
interface BaseImageProps {
  // ... 기존 props
  priority?: boolean; // 새 prop 추가
}

export function Image({ priority, ... }: ImageProps) {
  // priority 로직 구현
}
```

#### 2. 자동 빌드 확인

```bash
# 터미널에서 watch 모드 실행 중이면 자동 빌드됨
# 또는 수동으로
pnpm run build
```

#### 3. 사용 프로젝트에서 테스트

```typescript
// /dev/malang-deploy/src/components/MyComponent.tsx
import { Image } from "@son426/vite-image/react";

function MyComponent() {
  return (
    <Image
      src="..."
      priority={true}  // 새 prop 테스트
      // ...
    />
  );
}
```

#### 4. 브라우저에서 확인

- Vite가 자동으로 변경사항 감지
- 핫 리로드로 즉시 확인 가능

#### 5. 버그 수정 및 반복

- 문제 발견 → `vite-image`에서 수정 → 자동 빌드 → 즉시 확인

#### 6. 최종 픽스 후 배포

```bash
# /dev/vite-image에서
# 1. 버전 업데이트
# package.json: "version": "0.1.2"

# 2. 빌드
pnpm run build

# 3. 배포
npm publish
```

---

## ⚠️ 주의사항 및 문제 해결

### 1. 빌드가 안 되면

```bash
# 라이브러리 프로젝트에서
cd /Users/son/dev/vite-image
pnpm run build  # 수동 빌드
```

### 2. 변경사항이 반영 안 될 때

**원인**: Vite가 `node_modules`의 변경을 감지하지 못함

**해결책**:
```bash
# 사용 프로젝트에서
cd /Users/son/dev/malang-deploy

# 방법 1: 개발 서버 재시작
# Ctrl+C로 중지 후
pnpm run dev

# 방법 2: node_modules 캐시 클리어
rm -rf node_modules/.vite
pnpm run dev
```

### 3. TypeScript 타입이 업데이트 안 될 때

```bash
# VS Code에서
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# 또는 터미널에서
cd /Users/son/dev/malang-deploy
rm -rf node_modules/@son426
pnpm install
```

### 4. 링크가 깨졌을 때

```bash
# 라이브러리 프로젝트에서 다시 링크
cd /Users/son/dev/vite-image
pnpm link --global

# 사용 프로젝트에서 다시 연결
cd /Users/son/dev/malang-deploy
pnpm link --global @son426/vite-image
```

### 5. peer dependencies 경고

```bash
# 사용 프로젝트에 필요한 패키지 설치
cd /Users/son/dev/malang-deploy
pnpm add react vite vite-imagetools
```

---

## 🎯 추천 워크플로우 (최종)

### 초기 설정 (최초 1회)

```bash
# 1. 라이브러리 빌드 및 링크
cd /Users/son/dev/vite-image
pnpm run build
pnpm link --global

# 2. 사용 프로젝트에서 링크 연결
cd /Users/son/dev/malang-deploy
pnpm link --global @son426/vite-image
```

### 일상적인 개발

```bash
# 터미널 1: 라이브러리 자동 빌드
cd /Users/son/dev/vite-image
pnpm run dev

# 터미널 2: 사용 프로젝트 개발 서버
cd /Users/son/dev/malang-deploy
pnpm run dev
```

### 배포 전

```bash
# 1. 최종 테스트
# 2. 버전 업데이트 (package.json)
# 3. 빌드
cd /Users/son/dev/vite-image
pnpm run build

# 4. 배포
npm publish

# 5. 사용 프로젝트에서 npm 버전으로 전환 (선택사항)
cd /Users/son/dev/malang-deploy
pnpm unlink @son426/vite-image
pnpm add @son426/vite-image@latest
```

---

## 📝 체크리스트

### 초기 설정
- [ ] 라이브러리 빌드 (`pnpm run build`)
- [ ] 글로벌 링크 등록 (`pnpm link --global`)
- [ ] 사용 프로젝트에서 링크 연결 (`pnpm link --global @son426/vite-image`)

### 개발 중
- [ ] 라이브러리 watch 모드 실행 (`pnpm run dev`)
- [ ] 사용 프로젝트 개발 서버 실행
- [ ] 변경사항 자동 반영 확인

### 배포 전
- [ ] 모든 기능 테스트 완료
- [ ] 버전 업데이트
- [ ] 빌드 확인
- [ ] npm publish

---

이제 로컬에서 빠르게 개발하고 테스트할 수 있습니다! 🚀

