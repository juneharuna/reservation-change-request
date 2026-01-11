# 방문평가 일정변경 요청 시스템 - 기술 명세서 (Technical Specification)

이 프로젝트는 현대자동차 인증중고차 방문평가 과정에서 발생하는 일정 변경 요청을 체계적으로 관리하기 위해 개발되었습니다. 카마스터(요청자), 협력사(평가업체), 관리자 세 가지 역할을 중심으로 데이터의 실시간 동기화와 모바일 최적화된 사용자 경험을 제공합니다.

---

## 1. 프로젝트 목적 (Purpose)
- **일정 관리의 디지털화**: 수기로 진행되던 일정 변경 요청을 시스템화하여 누락 방지 및 처리 속도 향상.
- **실시간 데이터 공유**: 요청 발생 시 협력사가 즉시 확인하고 결과를 처리하여 요청자에게 실시간으로 피드백 제공.
- **모바일 접근성 강화**: 현장 업무가 많은 카마스터와 평가사를 위해 아이폰/안드로이드 등 모바일 기기에서의 최적화된 UI/UX 제공.

## 2. 기술 스택 (Technology Stack)

### Frontend
- **Framework**: `React` (Vite)
- **UI Library**: `Mantine UI` (v7+) - 고도로 커스터마이징 가능한 컴포넌트 라이브러리.
- **Styling**: `Vanilla CSS` + `Tailwind CSS` - 유연한 레이아웃과 디자인 시스템 구축.
- **Icons**: `Lucide React` - 일관된 디자인의 벡터 아이콘.
- **State Management**: `Zustand` - 가볍고 빠른 상태 관리와 미들웨어를 통한 데이터 영속성 처리.

### Backend
- **Runtime**: `Node.js`
- **Framework**: `Express.js`
- **Database**: `requests.json` (File-based database) - 경량화된 파일 기반 데이터베이스를 사용하여 별도의 DB 구축 없이 빠른 배포 및 데이터 영속성 보장.
- **Runtime Manager**: `PM2` - 서버 프로세스의 안정적인 운영 및 자동 재시작 보장.

---

## 3. 시스템 구조 및 작동 원리 (Architecture & Principles)

### 데이터 동기화 (Data Synchronization)
- **Server-Side Source of Truth**: 모든 요청 데이터는 서버의 `requests.json`에 저장됩니다.
- **Polling Sync**: 클라이언트는 5초 주기(App.jsx 설정)로 서버에 최신 데이터를 요청하여 모바일과 PC 등 여러 기기 간의 데이터 일관성을 실시간으로 유지합니다.
- **Zustand Persistence**: 로컬 캐시를 위해 `zustand/middleware/persist`를 병행 사용하며, 브라우저 새로고침 시에도 빠른 초기 렌더링을 보장합니다.

### 역할별 주요 흐름 (Role-based Workflow)
1. **카마스터 (Carmaster)**
   - 차량번호 조회를 통한 기존 요청 상태 확인.
   - 신규 일정변경 요청 제출 (모바일 번호 입력 시 숫자 키패드 자동 활성화 등 UX 최적화).
   - 실시간 처리 현황 추적.
2. **협력사 (Partner)**
   - 워크보드(Workboard)를 통한 미확인 요청 실시간 모니터링.
   - 요청 확인 및 일정 조정 처리 (성공/불가).
   - '요청 일정대로 확정' 시 원본 희망일시를 즉시 확인 가능한 스마트 라벨 기능.
3. **관리자 (Manager)**
   - 전체 협력사의 처리 현황 및 통계 대시보드 확인.

---

## 4. 디렉토리 구조 (Directory Structure)

```text
reservation_change_request/
├── reservation/            # 배포용 패키지 (GCP 배포를 위한 Bundle)
├── src/
│   ├── core/               # 핵심 핵심 비즈니스 로직
│   │   ├── services/       # API 서버 통신 및 로컬 스토리지 서비스
│   │   └── store/          # Zustand 전역 상태 (useRequestStore)
│   ├── features/           # 도메인 기반 기능 모듈
│   │   ├── carmaster/      # 요청자용 UI (Search, Form, Status)
│   │   └── partner/        # 협력사/관리자용 워크보드 및 대시보드
│   ├── shared/             # 공용 컴포넌트 및 유틸리티
│   │   ├── components/     # 역할 공용 UI 요소
│   │   ├── constants/      # 상태 정의 및 초기 목업 데이터
│   │   └── utils/          # 날짜/시간 포맷팅 헬퍼
│   ├── App.jsx             # 메인 라우팅 및 테마 설정, 데이터 폴링 로직
│   └── main.jsx            # React Entry Point
├── server.cjs              # Express API 서버 (정적 파일 서버 및 API 엔드포인트)
└── requests.json           # 데이터 저장 파일 (서버 실행 시 자동 생성)
```

## 5. 주요 최적화 사항 (Key Optimizations)
- **반응형 디자인**: iPhone 17 Pro 등 최신 모바일 해상도에서 텍스트 잘림 없는 카드 너비 자동 조정.
- **모바일 입력 편의성**: 연락처 입력 시 `inputMode="numeric"`을 통한 숫자 키패드 호출.
- **사용자 경험(UX)**: 최근 검색 차량번호 저장 및 클릭 시 즉시 조회 기능.
- **성능**: Vite 빌드 최적화 및 PM2를 통한 무중단 서비스 환경 구축.
