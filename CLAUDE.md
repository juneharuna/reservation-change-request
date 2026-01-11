# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

현대 인증중고차 예약 일정 변경 요청 관리 시스템. 카마스터가 일정 변경을 요청하면 협력사(카뷰, CTS컴퍼니)가 처리하는 구조. 매니저용 대시보드 포함.

## 명령어

```bash
# 개발 서버 (Vite dev + localhost:8080으로 API 프록시)
npm run dev

# 프로덕션 빌드
npm run build

# 린트
npm run lint

# 프로덕션 서버 (빌드된 프론트엔드 + API 서빙)
npm run start
```

**참고:** 로컬 개발 시 `npm run dev`(프론트엔드)와 `npm run start`(백엔드 API)를 동시에 실행해야 함. Vite 개발 서버가 `/api` 요청을 8080 포트의 Express 서버로 프록시함.

## 아키텍처

### 프론트엔드 (React + Vite)

**기능별 구조** `src/features/`:
- `carmaster/` - 요청 생성 플로우 (차량 검색, 폼 작성, 상태 확인)
- `partner/` - 협력사 요청 처리 화면 + 매니저 대시보드

**공통 코드** `src/shared/`:
- `components/` - 재사용 UI (Button, Input, Card, Badge, Pickers, Toast, Navbar)
- `constants/` - 목업 데이터, 역할, 협력사, 상태 정의
- `utils/` - 날짜 헬퍼, ID 생성기, 클래스명 병합 (`cn`)

**핵심 인프라** `src/core/`:
- `store/useRequestStore.js` - Zustand 스토어, 요청 CRUD 및 비즈니스 로직 (오배정 시 자동 이관 등)
- `services/api/apiService.js` - REST API 클라이언트
- `services/storage/` - LocalStorage 추상화
- `config/` - 앱 설정 (스토리지 키, 환경변수)

### 백엔드 (`reservation/server.cjs`)

Express 서버:
- `GET /api/requests` - 전체 요청 조회
- `POST /api/requests` - 전체 요청 저장 (배열 전체 교체 방식)
- `dist/` 정적 파일 서빙 (프로덕션)
- 데이터는 `reservation/requests.json`에 저장

### 상태 관리

Zustand + localStorage 영속화. 스토어 주요 기능:
- 요청 생명주기 (pending → received → success/failed/transferred/terminated)
- 오배정 시 자동 타사 이관 로직
- storage 이벤트를 통한 탭 간 동기화
- 5초 간격 서버 폴링

### UI 라이브러리

- Mantine v8 - 복잡한 컴포넌트 (날짜/시간 선택)
- Tailwind CSS v4 - 스타일링
- Recharts - 대시보드 차트
- Lucide React - 아이콘

---

## 변경 이력

### 2026-01-11: 버그 수정 및 리팩토링

#### 주요 버그 수정

| 파일 | 문제 | 수정 내용 |
|------|------|-----------|
| `usePartnerAdmin.js` | 서버 폴링(5초) 시 협력사 관리자 화면에서 "조정 불가" 선택 후 라디오 버튼 클릭 시 폼이 리셋됨 | `previousSelectedIdRef`를 사용하여 실제로 새 요청 선택 시에만 `stagedData` 초기화하도록 수정 |
| `StatusMode.jsx:17` | React Hook이 조건부 return 이후에 호출됨 (Rules of Hooks 위반) | useEffect를 조건부 return 전으로 이동 |
| `useCarmasterFlow.js:109` | 새 차량 검색 시 formData가 불완전하게 초기화됨 (이전 입력값 잔존) | 모든 필드를 완전히 초기화하도록 수정 |
| `usePartnerAdmin.js:83` | 날짜 포맷 불일치 (`toLocaleString` vs `getCurrentFormattedDateTime`) | `getCurrentFormattedDateTime()` 사용으로 통일 |
| `StatusMode.jsx:125` | TIME_TYPES 상수 대신 하드코딩된 문자열 'AM', 'PM', 'SPECIFIC' 사용 | 상수 import 및 사용 |

#### 코드 정리 (리팩토링)

| 파일 | 수정 내용 |
|------|-----------|
| `Toast.jsx` | 중복된 `cn` 함수 제거, `shared/utils/cn.js`에서 import |
| `PartnerAdminView.jsx` | 사용하지 않는 import 제거 (`Phone`, `Check`, `X`, `ScrollArea`, `ActionIcon`, `Transition`, `RingProgress`) |
| `FormMode.jsx` | 사용하지 않는 `onBackToSearch` prop 제거 |
| `CarmasterView.jsx` | FormMode에 전달하던 불필요한 `onBackToSearch` prop 제거 |
| `Pickers.jsx` | 사용하지 않는 `today` 변수 제거 |
| `StorageService.js` | 추상 메서드 파라미터에 underscore prefix 추가 (`_key`, `_value`) |
| `useRecentCars.js` | useEffect에서 useState lazy initializer 패턴으로 변경 (성능 개선) |
| `ManagerDashboard.jsx` | Icon 매개변수 처리 방식 개선 (`icon: IconComponent` → `const IconElement = icon`) |
| `server.cjs` (루트) | 중복 주석 제거 |

#### ESLint 설정 개선 (`eslint.config.js`)

```javascript
rules: {
  'no-unused-vars': ['error', {
    varsIgnorePattern: '^[A-Z_]',
    argsIgnorePattern: '^_',           // 추가
    caughtErrorsIgnorePattern: '^_'    // 추가
  }],
  'react-hooks/set-state-in-effect': 'warn',  // 추가 (유효한 React 패턴 허용)
}
```
- `reservation/dist` 폴더 무시 추가

#### 현재 ESLint 상태
- 오류: 0개
- 경고: 1개 (`usePartnerAdmin.js` - setState in effect, 의도된 패턴이므로 무시)

---

## GCP 배포

### 배포 파일

- 위치: `/Users/june/reservation_change_request/reservation_deploy_2.zip`
- 새 배포 시 넘버링 증가 (예: `reservation_deploy_3.zip`)

### 배포 파일 생성 방법

```bash
npm run build && \
rm -rf deploy_package && \
mkdir -p deploy_package && \
cp -r dist deploy_package/ && \
echo '[]' > deploy_package/requests.json && \
cat > deploy_package/server.cjs << 'EOF'
# server.cjs 내용 (reservation/server.cjs 참고, 경로만 ./dist로 변경)
EOF
cat > deploy_package/package.json << 'EOF'
{
  "name": "reservation-change-request",
  "version": "1.0.0",
  "scripts": { "start": "node server.cjs" },
  "dependencies": { "express": "^4.21.2" }
}
EOF
cd deploy_package && zip -r ../reservation_deploy_N.zip . && cd .. && rm -rf deploy_package
```

### GCP VM 배포 (업데이트)

1. 로컬에서 VM으로 업로드:
```bash
gcloud compute scp reservation_deploy_N.zip [VM_NAME]:/home/[USERNAME]/ --zone=[ZONE]
```

2. VM에서 실행:
```bash
pm2 stop reservation-app && \
cp ~/reservation_app/requests.json ~/requests_backup.json && \
rm -rf ~/reservation_app && \
unzip ~/reservation_deploy_N.zip -d ~/reservation_app && \
cp ~/requests_backup.json ~/reservation_app/requests.json && \
cd ~/reservation_app && \
npm install && \
pm2 restart reservation-app && \
pm2 status
```

### 현재 운영 서버

- URL: `http://34.50.44.100:8080`
- PM2 프로세스명: `reservation-app`

---

## 알려진 이슈 및 주의사항

1. **서버 폴링**: `App.jsx`에서 5초마다 `fetchRequests()` 호출하여 서버와 동기화
2. **번들 크기 경고**: 빌드 시 500KB 초과 경고 발생 (기능상 문제 없음, 필요시 코드 스플리팅 적용)
3. **데이터 저장**: `requests.json` 파일 기반 (DB 미사용), 서버 재시작 시에도 데이터 유지됨
