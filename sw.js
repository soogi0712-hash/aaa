# 예스결재 (YesApproval)
> 전기공사 전자결재 시스템

## 📌 프로젝트 개요
- **타입**: 정적 웹앱 (SPA) + PWA
- **기술**: HTML5 / CSS3 / Vanilla JavaScript
- **DB**: RESTful Table API (`tables/{table}` 상대경로)
- **버전**: 2026-05-01

---

## 🗂️ 파일 구조
```
yesapproval/
├── index.html          ← 메인 진입점 (로그인 + 앱 레이아웃)
├── sw.js               ← Service Worker (PWA 오프라인 캐시)
├── manifest.json       ← PWA 매니페스트
├── schema.json         ← DB 테이블 스키마 정의
├── css/
│   └── style.css       ← 전체 스타일시트 (반응형)
└── js/
    ├── api.js          ← Table API 래퍼 + 자동결재라인 + 연차계산
    ├── app.js          ← 로그인/라우팅/모달/결재처리/알림
    ├── dashboard.js    ← 대시보드
    ├── form-vac.js     ← 연차신청서 폼
    ├── form-ovt.js     ← 연장근무신청서 폼
    ├── my-docs.js      ← 내 문서함
    ├── approval-box.js ← 결재함
    ├── search.js       ← 통합조회
    ├── admin.js        ← 관리자 현황/사용자관리/감사로그
    └── pwa.js          ← PWA 설치 배너/iOS 가이드
```

---

## 👤 기본 계정
| 사원번호 | 이름   | 비밀번호 | 직급 | 역할     |
|---------|--------|---------|-----|----------|
| admin   | 이지숙 | admin   | 이사 | ADMIN    |
| EMP008  | 박태성 | 1234    | 대표 | EMPLOYEE |
| EMP001  | 강대구 | 1234    | 부장 | MANAGER  |
| EMP002  | 최주원 | 1234    | 주임 | EMPLOYEE |
| EMP003  | 황시은 | 1234    | 대리 | EMPLOYEE |
| EMP004  | 김현빈 | 1234    | 주임 | EMPLOYEE |
| EMP005  | 김성환 | 1234    | 대리 | EMPLOYEE |
| EMP006  | 이경동 | 1234    | 대리 | EMPLOYEE |

> 앱 시작 시 `initDefaultUsers()`가 자동 실행되어 없는 계정을 생성합니다.

---

## 🗄️ DB 테이블 목록
| 테이블명          | 설명              |
|------------------|------------------|
| users            | 사용자 계정       |
| documents        | 전자결재 문서     |
| approval_steps   | 결재 단계 내역    |
| leave_balances   | 연차 잔여일수     |
| doc_seq          | 문서번호 연번     |
| audit_logs       | 감사 로그         |
| approval_templates | 결재선 템플릿   |

---

## ⚙️ 주요 기능
1. **로그인** — 사원번호/비밀번호 인증, 세션 유지
2. **연차신청서** — 잔여연차 실시간 표시, 초과방지, 자동결재라인
3. **연장근무신청서** — 근무자 다수 추가, 시간 자동 계산
4. **내 문서함** — 상태별 필터, 검색, 임시저장/취소
5. **결재함** — 대기/완료 탭, 승인/반려 처리
6. **통합조회** — 관리자: 전체, 직원: 본인 관련 문서만
7. **관리자 현황** — 문서통계, 연차현황, 부서별현황
8. **사용자 관리** — CRUD, 활성화/비활성화
9. **결재선 템플릿** — 관리자 등록/수정/삭제
10. **감사로그** — 전체 시스템 이벤트 기록
11. **실시간 알림** — 30초 폴링, 결재완료 팝업
12. **PWA** — 홈화면 설치 (Android/iOS)

---

## 🔑 결재라인 규칙
- **황시은(EMP003) 기안** → 이지숙(admin) → 박태성(EMP008) 다이렉트
- **일반 직원 기안** → 기안자 직급 이상 모든 활성 사용자 (직급 오름차순, 대표 마지막)
- 이지숙은 결재라인에서 항상 제외됨

---

## 📡 API 호출 방식
```javascript
// 모두 상대경로 사용
fetch('tables/users')               // 목록 조회
fetch('tables/users/ID')            // 단건 조회
fetch('tables/users', { method: 'POST', ... })    // 생성
fetch('tables/users/ID', { method: 'PATCH', ... }) // 수정
fetch('tables/users/ID', { method: 'DELETE' })     // 삭제
```

---

## 🚀 새 환경에 배포하기
1. 이 ZIP을 새 프로젝트에 업로드
2. DB 테이블 7개 생성 (schema.json 참고)
3. 배포 → 첫 접속 시 기본 계정 자동 생성
4. `admin` / `admin` 으로 로그인

---

*Last updated: 2026-05-01*
