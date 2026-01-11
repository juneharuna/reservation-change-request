# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**현대 인증중고차 예약 일정 변경 요청 관리 시스템**

카마스터가 일정 변경을 요청하면 협력사(카뷰, CTS컴퍼니)가 처리하는 3단계 시스템. 매니저용 분석 대시보드 포함.

---

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

---

## 디렉토리 구조

```
reservation-change-request/
├── src/
│   ├── App.jsx                    # 루트 컴포넌트 (역할 전환)
│   ├── main.jsx                   # React DOM 엔트리 포인트
│   ├── index.css                  # 글로벌 스타일
│   │
│   ├── core/                      # 핵심 인프라
│   │   ├── config/index.js        # 앱 설정 (스토리지 키, 환경변수)
│   │   ├── store/useRequestStore.js    # Zustand 스토어
│   │   └── services/
│   │       ├── api/apiService.js       # REST API 클라이언트
│   │       ├── storage/                # LocalStorage 추상화
│   │       └── migration/              # 레거시 정리 서비스
│   │
│   ├── features/                  # 기능별 구조
│   │   ├── carmaster/
│   │   │   ├── components/
│   │   │   │   ├── CarmasterView.jsx   # 메인 컨테이너
│   │   │   │   ├── SearchMode.jsx      # 차량 검색 UI
│   │   │   │   ├── FormMode.jsx        # 일정 변경 요청 폼
│   │   │   │   ├── StatusMode.jsx      # 요청 상태 표시
│   │   │   │   └── RecentSearchList.jsx
│   │   │   └── hooks/
│   │   │       ├── useCarmasterFlow.js # 플로우 로직
│   │   │       └── useRecentCars.js    # 최근 검색 캐싱
│   │   │
│   │   └── partner/
│   │       ├── components/
│   │       │   ├── PartnerAdminView.jsx  # 협력사 처리 화면
│   │       │   └── ManagerDashboard.jsx  # 분석 대시보드
│   │       └── hooks/
│   │           └── usePartnerAdmin.js    # 협력사 관리 로직
│   │
│   └── shared/                    # 공통 코드
│       ├── components/            # 재사용 UI
│       │   ├── Badge.jsx, Button.jsx, Card.jsx, Input.jsx
│       │   ├── Navbar.jsx, Pickers.jsx, Toast.jsx
│       │   └── index.js
│       ├── constants/index.js     # 목업 데이터, 역할, 상태, 평가 결과 정의
│       └── utils/
│           ├── cn.js              # 클래스명 병합 (clsx + tailwind-merge)
│           ├── dateHelpers.js     # 날짜 헬퍼 함수
│           ├── scheduleHelpers.js # 일정 포맷팅
│           └── idGenerator.js     # 요청 ID 생성기
│
├── reservation/
│   ├── server.cjs                 # Express 백엔드 서버
│   ├── package.json
│   ├── requests.json              # 데이터 영속화 파일
│   └── dist/                      # 프로덕션 빌드된 프론트엔드
│
├── public/                        # 정적 에셋
├── package.json                   # 프론트엔드 의존성
├── vite.config.js                 # Vite 빌드 설정
├── tailwind.config.js             # Tailwind CSS 테마
├── eslint.config.js               # ESLint 규칙
└── Dockerfile                     # 컨테이너 설정
```

---

## 기술 스택

### 프론트엔드

| 카테고리 | 기술 | 버전 |
|---------|-----|------|
| 프레임워크 | React | 19.2.0 |
| 빌드 도구 | Vite | 7.2.4 |
| 상태 관리 | Zustand | 5.0.9 |
| UI 라이브러리 | Mantine | 8.3.10 |
| 스타일링 | Tailwind CSS | 4.1.18 |
| 차트 | Recharts | 3.6.0 |
| 아이콘 | Lucide React | 0.562.0 |
| 날짜 | date-fns 4.1.0, dayjs 1.11.19 |
| 유틸리티 | clsx 2.1.1, tailwind-merge 3.4.0 |

### 백엔드

| 컴포넌트 | 기술 |
|---------|-----|
| 런타임 | Node.js |
| 서버 | Express 4.22.1 |
| 데이터 영속화 | JSON 파일 (requests.json) |
| 모듈 타입 | CommonJS (server.cjs) |

---

## API 엔드포인트

**기본 경로:** `/api/`
**개발 프록시:** Vite가 `/api` 요청을 `http://localhost:8080`으로 프록시

| 메서드 | 엔드포인트 | 설명 | 입력 | 출력 |
|--------|-----------|------|-----|------|
| GET | `/api/requests` | 전체 요청 조회 | - | 요청 객체 배열 |
| POST | `/api/requests` | 전체 요청 저장 (배열 전체 교체) | 요청 객체 배열 | `{ success: true, count: N }` |

---

## 상태 관리

### Zustand 스토어 (`src/core/store/useRequestStore.js`)

```javascript
{
  // 데이터
  requests: Array,
  isSaving: Boolean,

  // 토스트 알림
  toast: { message, type, visible },

  // 하이드레이션
  _hasHydrated: Boolean,

  // 액션
  addRequest(request)
  updateRequestStatus(id, updates)
  processEvaluationResult(id, result)
  fetchRequests()
  syncWithLocalStorage()
  showToast(message, type)
  hideToast()
  setHasHydrated(state)
}
```

### 주요 기능

- **영속화:** persist 미들웨어 + localStorage (키: `'reservation_change_request_v4'`)
- **서버 동기화:** App.jsx에서 5초마다 `fetchRequests()` 폴링
- **탭 간 동기화:** storage 이벤트 리스너로 실시간 업데이트
- **자동 이관 로직:** 오배정 실패 시:
  - 첫 번째 시도: 타사로 자동 이관 (transferCount 증가)
  - 두 번째 시도: "확인 불가"로 종결

---

## 요청 데이터 모델

```javascript
{
  id: string,                    // 형식: REQ-YYMMDD-XXXX
  carNumber: string,             // 차량 번호
  requester: string,             // 카마스터 이름 + 지점
  requesterPhone: string,
  partner: string,               // '카뷰' | 'CTS컴퍼니'
  status: string,                // pending|received|success|failed|transferred|terminated|cancelled
  reason: string,                // 변경 사유
  requestedSchedule: {
    date: string,                // YYYY-MM-DD
    timeType: string,            // AM|PM|SPECIFIC
    timeValue: string            // HH:mm (SPECIFIC인 경우)
  },
  confirmedSchedule: Object|null,
  createdAt: string,             // 타임스탬프
  receivedAt: string,
  processedAt: string,
  resultType: string,            // success|failed (평가 결과)
  detailedReason: string,        // success_original|success_other|failure_partner 등
  rejectReason: string,          // 거절 사유 (선택)
  transferCount: number,         // 이관 횟수 추적
  previousPartner: string|null   // 이관 추적용
}
```

### 요청 상태 생명주기

```
pending → received → [success | failed | transferred | terminated | cancelled]
```

---

## 상수 및 열거형 (`src/shared/constants/index.js`)

### 요청 상태 (REQUEST_STATUS)

| 상태 | 한글명 | 색상 |
|-----|-------|-----|
| PENDING | 접수 대기 | orange |
| RECEIVED | 일정조정 진행중 | blue |
| SUCCESS | 조정 완료 | green |
| FAILED | 조정 불가 | red |
| CANCELLED | 요청 취소됨 | slate |
| TRANSFERRED | 타사 이관됨 | slate |
| TERMINATED | 확인 불가 (종결) | red |

### 평가 결과 유형 (EVALUATION_RESULT_TYPES)

| 값 | 설명 |
|---|-----|
| success_original | 요청대로 확정 |
| success_other | 다른 시간으로 조정 |
| failure_partner | 협력사 불가 |
| failure_customer | 고객 불가 |
| failure_wrong_partner | 오배정 (자동 이관 트리거) |

### 협력사 (PARTNERS)

- **카뷰** - Blue 테마
- **CTS컴퍼니** - Emerald 테마

### 역할 (ROLES)

| 역할 | 설명 |
|-----|-----|
| carmaster | 요청 생성 |
| partner_carview | 카뷰 관리자 |
| partner_cts | CTS 관리자 |
| manager | 대시보드 분석 |

### 시간 유형 (TIME_TYPES)

```javascript
TIME_TYPES = { AM: 'AM', PM: 'PM', SPECIFIC: 'SPECIFIC' }
TIME_TYPE_LABELS = { AM: '오전 중 가능', PM: '오후 중 가능', SPECIFIC: '특정 시간' }
```

---

## 유틸리티 함수

### 날짜 헬퍼 (`src/shared/utils/dateHelpers.js`)

```javascript
parseCustomDate(dateStr)           // 커스텀 포맷 → Date 객체
getDiffDays(targetDate)            // 현재로부터 일수 차이
getCurrentFormattedDateTime()      // "YYYY-MM-DD HH:MM:SS" 형식
```

### 일정 헬퍼 (`src/shared/utils/scheduleHelpers.js`)

```javascript
formatSchedule(schedule)           // "2025. 12. 30. | 14:00"
formatScheduleWithDay(schedule)    // "2025-12-30(화) 14:00"
```

### 기타

```javascript
cn(...classes)                     // 클래스명 병합 (clsx + tailwind-merge)
generateRequestId()                // "REQ-YYMMDD-XXXX" 형식 ID 생성
```

---

## Tailwind 테마 (`tailwind.config.js`)

### 커스텀 색상

```javascript
'hyundai-navy': '#002C5F'
'hyundai-blue': '#007FA8'
'hyundai-sand': '#E4DCD3'
'hyundai-gold': '#99775C'
'hyundai-gray': '#A2AAAD'
```

### 폰트

```javascript
fontFamily: { sans: ['Spoqa Han Sans Neo', 'sans-serif'] }
```

---

## ESLint 설정 (`eslint.config.js`)

```javascript
rules: {
  'no-unused-vars': ['error', {
    varsIgnorePattern: '^[A-Z_]',
    argsIgnorePattern: '^_',
    caughtErrorsIgnorePattern: '^_'
  }],
  'react-hooks/set-state-in-effect': 'warn'  // 의도된 패턴 허용
}
```

**무시 경로:** `dist/`, `reservation/dist/`

**현재 상태:** 오류 0개, 경고 1개 (usePartnerAdmin.js - setState in effect, 의도된 패턴)

---

## 개발 워크플로우

### 로컬 개발 시작

1. 터미널 1: `npm run start` (백엔드 API 서버, 포트 8080)
2. 터미널 2: `npm run dev` (프론트엔드 개발 서버, 포트 5173)

### 프로덕션 빌드

```bash
npm run build    # dist/ 폴더에 빌드
npm run start    # dist/ 서빙 + API
```

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
| `PartnerAdminView.jsx` | 사용하지 않는 import 제거 |
| `FormMode.jsx` | 사용하지 않는 `onBackToSearch` prop 제거 |
| `CarmasterView.jsx` | FormMode에 전달하던 불필요한 `onBackToSearch` prop 제거 |
| `Pickers.jsx` | 사용하지 않는 `today` 변수 제거 |
| `StorageService.js` | 추상 메서드 파라미터에 underscore prefix 추가 |
| `useRecentCars.js` | useState lazy initializer 패턴으로 변경 (성능 개선) |
| `ManagerDashboard.jsx` | Icon 매개변수 처리 방식 개선 |

---

## GCP 배포

### 배포 파일

- 위치: `/Users/june/reservation_change_request/reservation_deploy_N.zip`
- 새 배포 시 넘버링 증가

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

---

## AI 어시스턴트 가이드라인

### 코드 수정 시 주의사항

1. **상수 사용**: 하드코딩된 문자열 대신 `src/shared/constants/index.js`의 상수 사용
2. **날짜 포맷팅**: `getCurrentFormattedDateTime()` 함수 사용으로 일관성 유지
3. **클래스명 병합**: `shared/utils/cn.js`에서 `cn` 함수 import하여 사용
4. **React Hooks 규칙**: 조건부 return 이전에 모든 Hook 호출
5. **사용하지 않는 코드**: 사용하지 않는 import, 변수, prop은 즉시 제거

### 파일 위치 규칙

- **기능 컴포넌트**: `src/features/{feature}/components/`
- **기능 훅**: `src/features/{feature}/hooks/`
- **공통 컴포넌트**: `src/shared/components/`
- **공통 유틸리티**: `src/shared/utils/`
- **상태 관리**: `src/core/store/`
- **API 서비스**: `src/core/services/api/`

### 테스트 전 확인사항

```bash
npm run lint     # ESLint 오류 확인 (0개여야 함)
npm run build    # 빌드 성공 확인
```

### 주요 패턴

1. **서버 데이터 동기화**: POST는 전체 배열 교체 방식
2. **폼 상태 관리**: `stagedData` 패턴으로 저장 전까지 로컬 상태 유지
3. **이관 로직**: `transferCount`와 `previousPartner`로 이관 상태 추적
4. **탭 간 동기화**: storage 이벤트 + 5초 폴링 조합
