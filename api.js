/* =====================================================
   예스결재 (YesApproval) — 메인 스타일시트
   ===================================================== */

/* ── 기본 리셋 & 변수 ── */
:root {
  --primary:       #2563eb;
  --primary-dark:  #1d4ed8;
  --primary-light: #eff6ff;
  --success:       #16a34a;
  --success-light: #f0fdf4;
  --warning:       #d97706;
  --warning-light: #fffbeb;
  --danger:        #dc2626;
  --danger-light:  #fef2f2;
  --info:          #0891b2;
  --info-light:    #ecfeff;
  --gray-50:       #f9fafb;
  --gray-100:      #f3f4f6;
  --gray-200:      #e5e7eb;
  --gray-300:      #d1d5db;
  --gray-400:      #9ca3af;
  --gray-500:      #6b7280;
  --gray-600:      #4b5563;
  --gray-700:      #374151;
  --gray-800:      #1f2937;
  --gray-900:      #111827;
  --sidebar-w:     240px;
  --header-h:      56px;
  --radius:        8px;
  --radius-lg:     12px;
  --shadow-sm:     0 1px 3px rgba(0,0,0,.08);
  --shadow:        0 2px 8px rgba(0,0,0,.12);
  --shadow-lg:     0 8px 24px rgba(0,0,0,.16);
  --transition:    .18s ease;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 14px; scroll-behavior: smooth; }

body {
  font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  background: var(--gray-100);
  color: var(--gray-800);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }
button { cursor: pointer; font-family: inherit; }
input, select, textarea { font-family: inherit; }
ul, ol { list-style: none; }

/* ── 스크롤바 ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--gray-100); }
::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--gray-400); }

/* =====================================================
   로그인 페이지
   ===================================================== */
#login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
  padding: 20px;
}

.login-card {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 40px 36px;
  width: 100%;
  max-width: 400px;
}

.login-logo {
  text-align: center;
  margin-bottom: 28px;
}
.login-logo .logo-icon {
  width: 72px; height: 72px;
  background: transparent;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}
.login-logo .logo-icon i { color: var(--primary); font-size: 28px; }
.login-logo .logo-icon img { width: 72px; height: 72px; object-fit: contain; border-radius: 12px; }
.login-logo h1 { font-size: 22px; font-weight: 700; color: var(--gray-900); }
.login-logo p { font-size: 12px; color: var(--gray-500); margin-top: 2px; }

.login-form .form-group { margin-bottom: 16px; }
.login-form label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-600);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: .5px;
}
.login-form .input-wrap { position: relative; }
.login-form .input-wrap i {
  position: absolute;
  left: 12px; top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  font-size: 14px;
}
.login-form input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius);
  font-size: 14px;
  transition: border-color var(--transition);
  background: var(--gray-50);
}
.login-form input:focus {
  outline: none;
  border-color: var(--primary);
  background: #fff;
}
.login-form input::placeholder { color: var(--gray-400); }

.btn-login {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 600;
  margin-top: 8px;
  transition: background var(--transition), transform var(--transition);
}
.btn-login:hover { background: var(--primary-dark); transform: translateY(-1px); }
.btn-login:active { transform: translateY(0); }

.login-error {
  background: var(--danger-light);
  color: var(--danger);
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 13px;
  margin-top: 12px;
  display: none;
}
.login-error.show { display: block; }

/* =====================================================
   앱 레이아웃 (사이드바 + 메인)
   ===================================================== */
#app-layout {
  display: flex;
  min-height: 100vh;
}

/* ── 사이드바 ── */
#sidebar {
  width: var(--sidebar-w);
  background: var(--gray-900);
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0;
  height: 100vh;
  z-index: 200;
  transition: transform var(--transition);
  overflow-y: auto;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.sidebar-brand .brand-icon {
  width: 36px; height: 36px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sidebar-brand .brand-icon i { font-size: 16px; }
.sidebar-brand .brand-text h2 {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
}
.sidebar-brand .brand-text span {
  font-size: 10px;
  color: var(--gray-400);
}

.sidebar-user {
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}
.user-info .user-name { font-size: 13px; font-weight: 600; }
.user-info .user-role {
  font-size: 10px;
  color: var(--gray-400);
  margin-top: 1px;
}

.sidebar-nav { flex: 1; padding: 10px 0; }

.nav-section {
  padding: 8px 20px 4px;
  font-size: 10px;
  font-weight: 700;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 20px;
  color: var(--gray-400);
  font-size: 13px;
  font-weight: 500;
  transition: all var(--transition);
  cursor: pointer;
  position: relative;
  border-radius: 0;
}
.nav-item:hover {
  color: #fff;
  background: rgba(255,255,255,.06);
}
.nav-item.active {
  color: #fff;
  background: rgba(37,99,235,.35);
}
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--primary);
  border-radius: 0 2px 2px 0;
}
.nav-item i { width: 18px; text-align: center; font-size: 14px; }
.nav-badge {
  margin-left: auto;
  background: var(--danger);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}
.nav-badge-green {
  background: var(--success) !important;
  font-size: 9px;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,.08);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 12px;
  background: transparent;
  border: 1px solid rgba(255,255,255,.15);
  border-radius: var(--radius);
  color: var(--gray-400);
  font-size: 13px;
  transition: all var(--transition);
}
.btn-logout:hover {
  background: rgba(220,38,38,.2);
  border-color: var(--danger);
  color: #fca5a5;
}

/* ── 메인 콘텐츠 영역 ── */
#main-content {
  margin-left: var(--sidebar-w);
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
#top-header {
  height: var(--header-h);
  background: #fff;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 12px;
}
#hamburger-btn {
  display: none;
  background: none;
  border: none;
  color: var(--gray-600);
  font-size: 20px;
  padding: 4px;
}
#page-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-800);
  flex: 1;
}
.header-actions { display: flex; align-items: center; gap: 8px; }
.header-date {
  font-size: 12px;
  color: var(--gray-500);
}

/* 페이지 컨테이너 */
.page-container {
  flex: 1;
  padding: 24px;
  display: none;
}
.page-container.active { display: block; }

/* =====================================================
   공통 컴포넌트
   ===================================================== */

/* 카드 */
.card {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
}
.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--gray-800);
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-title i { color: var(--primary); }
.card-body { padding: 20px; }

/* 버튼 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  border: none;
  transition: all var(--transition);
  white-space: nowrap;
}
.btn-sm { padding: 5px 10px; font-size: 12px; }
.btn-lg { padding: 11px 22px; font-size: 15px; }
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-success { background: var(--success); color: #fff; }
.btn-success:hover { background: #15803d; }
.btn-danger { background: var(--danger); color: #fff; }
.btn-danger:hover { background: #b91c1c; }
.btn-warning { background: var(--warning); color: #fff; }
.btn-warning:hover { background: #b45309; }
.btn-outline {
  background: transparent;
  border: 1.5px solid var(--gray-300);
  color: var(--gray-700);
}
.btn-outline:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
.btn-ghost {
  background: transparent;
  color: var(--gray-600);
  border: none;
}
.btn-ghost:hover { background: var(--gray-100); color: var(--gray-900); }
.btn:disabled { opacity: .5; cursor: not-allowed; }

/* 배지 */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.badge-draft    { background: var(--gray-100);  color: var(--gray-600); }
.badge-pending  { background: var(--warning-light); color: var(--warning); }
.badge-approved { background: var(--success-light); color: var(--success); }
.badge-rejected { background: var(--danger-light); color: var(--danger); }
.badge-cancelled{ background: var(--gray-100); color: var(--gray-500); }
.badge-waiting  { background: var(--warning-light); color: var(--warning); }
.badge-primary  { background: var(--primary-light); color: var(--primary); }

/* 폼 요소 */
.form-group { margin-bottom: 16px; }
.form-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-600);
  margin-bottom: 6px;
}
.form-label.required::after {
  content: ' *';
  color: var(--danger);
}
.form-control {
  width: 100%;
  padding: 9px 12px;
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius);
  font-size: 13px;
  background: #fff;
  color: var(--gray-800);
  transition: border-color var(--transition);
}
.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37,99,235,.1);
}
.form-control:read-only {
  background: var(--gray-50);
  color: var(--gray-500);
}
.form-control::placeholder { color: var(--gray-400); }
textarea.form-control { resize: vertical; min-height: 80px; }
select.form-control { appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 8px center; background-size: 16px; padding-right: 32px; }

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.form-hint { font-size: 11px; color: var(--gray-500); margin-top: 4px; }
.form-error { font-size: 11px; color: var(--danger); margin-top: 4px; }

/* 테이블 */
.table-wrap { overflow-x: auto; }
table.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
table.data-table thead th {
  background: var(--gray-50);
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  color: var(--gray-600);
  border-bottom: 1px solid var(--gray-200);
  white-space: nowrap;
}
table.data-table tbody td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--gray-100);
  color: var(--gray-700);
  vertical-align: middle;
}
table.data-table tbody tr:hover { background: var(--gray-50); }
table.data-table tbody tr:last-child td { border-bottom: none; }
table.data-table td.text-center, table.data-table th.text-center { text-align: center; }
table.data-table td.text-right,  table.data-table th.text-right  { text-align: right; }

/* 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(2px);
}
.modal-overlay.open { display: flex; }

.modal {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modalIn .2s ease;
}
.modal-lg { max-width: 760px; }
.modal-xl { max-width: 1000px; }

@keyframes modalIn {
  from { opacity: 0; transform: translateY(-20px) scale(.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  padding: 18px 22px;
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-800);
  display: flex;
  align-items: center;
  gap: 8px;
}
.modal-title i { color: var(--primary); }
.modal-close {
  background: none;
  border: none;
  color: var(--gray-400);
  font-size: 18px;
  padding: 4px;
  border-radius: 6px;
  transition: all var(--transition);
}
.modal-close:hover { background: var(--gray-100); color: var(--gray-700); }
.modal-body { padding: 22px; overflow-y: auto; flex: 1; }
.modal-footer {
  padding: 14px 22px;
  border-top: 1px solid var(--gray-100);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 알림 토스트 */
#toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast {
  background: var(--gray-900);
  color: #fff;
  padding: 12px 18px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 260px;
  pointer-events: auto;
  animation: toastIn .25s ease;
  max-width: 360px;
}
.toast.toast-success { border-left: 4px solid var(--success); }
.toast.toast-error   { border-left: 4px solid var(--danger); }
.toast.toast-warning { border-left: 4px solid var(--warning); }
.toast.toast-info    { border-left: 4px solid var(--primary); }
.toast i { font-size: 15px; flex-shrink: 0; }
.toast.toast-success i { color: #4ade80; }
.toast.toast-error   i { color: #f87171; }
.toast.toast-warning i { color: #fbbf24; }
.toast.toast-info    i { color: #60a5fa; }
.toast-out { animation: toastOut .25s ease forwards; }

@keyframes toastIn  { from { opacity:0; transform: translateX(30px); } to { opacity:1; transform: translateX(0); } }
@keyframes toastOut { from { opacity:1; transform: translateX(0); }   to { opacity:0; transform: translateX(30px); } }

/* 로딩 스피너 */
.spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--gray-500);
  gap: 10px;
  font-size: 13px;
}
.spinner {
  width: 20px; height: 20px;
  border: 2px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--gray-500);
}
.empty-state i { font-size: 40px; color: var(--gray-300); margin-bottom: 12px; }
.empty-state p { font-size: 14px; }
.empty-state small { font-size: 12px; color: var(--gray-400); }

/* 탭 */
.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--gray-200);
  margin-bottom: 20px;
}
.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-500);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
}
.tab-btn:hover { color: var(--primary); }
.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.tab-count {
  background: var(--gray-200);
  color: var(--gray-600);
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
}
.tab-btn.active .tab-count {
  background: var(--primary);
  color: #fff;
}

/* 필터바 */
.filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  align-items: center;
}
.filter-bar .form-control { width: auto; min-width: 120px; }
.search-input-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}
.search-input-wrap i {
  position: absolute;
  left: 10px; top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  font-size: 13px;
}
.search-input-wrap input {
  width: 100%;
  padding: 9px 12px 9px 32px;
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius);
  font-size: 13px;
}
.search-input-wrap input:focus {
  outline: none;
  border-color: var(--primary);
}

/* 페이지네이션 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px 0;
}
.page-btn {
  min-width: 32px; height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--gray-200);
  border-radius: 6px;
  background: #fff;
  color: var(--gray-700);
  font-size: 12px;
  font-weight: 600;
  transition: all var(--transition);
  padding: 0 8px;
}
.page-btn:hover { border-color: var(--primary); color: var(--primary); }
.page-btn.active { background: var(--primary); border-color: var(--primary); color: #fff; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }

/* =====================================================
   대시보드
   ===================================================== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 20px;
  border: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: box-shadow var(--transition);
}
.stat-card:hover { box-shadow: var(--shadow); }

.stat-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.stat-icon.blue   { background: var(--primary-light); color: var(--primary); }
.stat-icon.green  { background: var(--success-light); color: var(--success); }
.stat-icon.yellow { background: var(--warning-light); color: var(--warning); }
.stat-icon.red    { background: var(--danger-light);  color: var(--danger); }

.stat-info .stat-num {
  font-size: 26px;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.1;
}
.stat-info .stat-label {
  font-size: 12px;
  color: var(--gray-500);
  margin-top: 2px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* =====================================================
   문서 양식 (연차 / 연장근무)
   ===================================================== */
.form-page-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  align-items: start;
}

/* 결재선 패널 */
.approval-line-panel {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
  position: sticky;
  top: calc(var(--header-h) + 20px);
}
.approval-line-panel .panel-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--gray-100);
  font-size: 13px;
  font-weight: 700;
  color: var(--gray-700);
  display: flex;
  align-items: center;
  gap: 6px;
}
.approval-line-panel .panel-body { padding: 12px 16px; }

.approval-step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--gray-100);
  font-size: 12px;
}
.approval-step-item:last-child { border-bottom: none; }
.step-num {
  width: 20px; height: 20px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}
.step-info .step-name { font-weight: 600; color: var(--gray-800); }
.step-info .step-dept { color: var(--gray-500); font-size: 11px; }
.step-status-icon { margin-left: auto; font-size: 14px; }

/* 문서 용지 스타일 */
.doc-paper {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
  overflow: hidden;
}
.doc-paper-header {
  background: var(--primary);
  color: #fff;
  padding: 20px 28px;
}
.doc-paper-header h2 { font-size: 20px; font-weight: 700; }
.doc-paper-header p  { font-size: 12px; opacity: .8; margin-top: 2px; }
.doc-paper-body { padding: 28px; }

.doc-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--gray-200);
}
.doc-meta-item label {
  font-size: 11px;
  color: var(--gray-500);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .4px;
}
.doc-meta-item span, .doc-meta-item input {
  display: block;
  font-size: 13px;
  color: var(--gray-800);
  font-weight: 500;
  margin-top: 2px;
}

.doc-section { margin-bottom: 24px; }
.doc-section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--gray-700);
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 연장근무 신청 테이블 */
.ovt-worker-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.ovt-worker-table th {
  background: var(--gray-50);
  padding: 8px 10px;
  text-align: center;
  font-weight: 600;
  color: var(--gray-600);
  border: 1px solid var(--gray-200);
}
.ovt-worker-table td {
  padding: 6px 8px;
  border: 1px solid var(--gray-200);
  vertical-align: middle;
}
.ovt-worker-table td input,
.ovt-worker-table td select {
  width: 100%;
  padding: 5px 8px;
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  font-size: 12px;
  background: #fff;
}
.ovt-worker-table td input:focus,
.ovt-worker-table td select:focus {
  outline: none;
  border-color: var(--primary);
}

.btn-add-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--gray-50);
  border: 1.5px dashed var(--gray-300);
  border-radius: var(--radius);
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
  transition: all var(--transition);
}
.btn-add-row:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

/* 결재 버튼 영역 */
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid var(--gray-200);
  margin-top: 24px;
}

/* =====================================================
   결재선 뷰어 (상세/처리 모달)
   ===================================================== */
.approval-timeline {
  position: relative;
  padding-left: 28px;
}
.approval-timeline::before {
  content: '';
  position: absolute;
  left: 9px; top: 20px; bottom: 20px;
  width: 2px;
  background: var(--gray-200);
}
.timeline-item {
  position: relative;
  margin-bottom: 16px;
}
.timeline-dot {
  position: absolute;
  left: -28px;
  top: 10px;
  width: 20px; height: 20px;
  border-radius: 50%;
  border: 2px solid var(--gray-300);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  z-index: 1;
}
.timeline-dot.waiting   { border-color: var(--warning); background: var(--warning-light); color: var(--warning); }
.timeline-dot.approved  { border-color: var(--success); background: var(--success-light); color: var(--success); }
.timeline-dot.rejected  { border-color: var(--danger);  background: var(--danger-light);  color: var(--danger); }
.timeline-dot.skipped   { border-color: var(--gray-300); background: var(--gray-100); color: var(--gray-400); }

.timeline-content {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 13px;
}
.timeline-content .tc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.timeline-content .tc-name { font-weight: 700; color: var(--gray-800); }
.timeline-content .tc-label { font-size: 11px; color: var(--gray-500); }
.timeline-content .tc-date  { font-size: 11px; color: var(--gray-400); }
.timeline-content .tc-comment {
  font-size: 12px;
  color: var(--gray-600);
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  padding: 6px 10px;
  margin-top: 6px;
}

/* =====================================================
   문서 상세 모달
   ===================================================== */
.doc-detail-wrap {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
}

/* =====================================================
   관리자 현황
   ===================================================== */
.admin-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  text-align: center;
}
.summary-card .sc-num {
  font-size: 32px;
  font-weight: 800;
  color: var(--primary);
}
.summary-card .sc-label {
  font-size: 12px;
  color: var(--gray-500);
  margin-top: 4px;
}

/* 사용자 관리 그리드 */
.user-manage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}
.user-card {
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.user-card .uc-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}
.user-card .uc-info .uc-name { font-size: 14px; font-weight: 700; }
.user-card .uc-info .uc-sub  { font-size: 12px; color: var(--gray-500); margin-top: 2px; }
.user-card .uc-actions { margin-left: auto; display: flex; gap: 6px; }

/* =====================================================
   로그인 알림 팝업 (LoginNotify)
   ===================================================== */
.notify-popup {
  position: fixed;
  top: 70px; right: 20px;
  width: 340px;
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--gray-200);
  z-index: 800;
  animation: notifyIn .3s ease;
  overflow: hidden;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
@keyframes notifyIn {
  from { opacity:0; transform: translateX(20px); }
  to   { opacity:1; transform: translateX(0); }
}
@keyframes slideInRight {
  from { opacity:0; transform: translateX(60px); }
  to   { opacity:1; transform: translateX(0); }
}
.notify-header {
  background: var(--primary);
  color: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.notify-header h3 { font-size: 13px; font-weight: 700; }
.notify-close {
  background: none;
  border: none;
  color: rgba(255,255,255,.7);
  font-size: 16px;
  cursor: pointer;
}
.notify-close:hover { color: #fff; }
.notify-body { overflow-y: auto; flex: 1; padding: 12px; }
.notify-section { margin-bottom: 12px; }
.notify-section-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--gray-100);
}
.notify-item {
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background var(--transition);
}
.notify-item:hover { background: var(--gray-50); }
.notify-item.highlight { background: var(--warning-light); border-left: 3px solid var(--warning); }
.notify-item .ni-title { font-weight: 600; color: var(--gray-800); }
.notify-item .ni-sub   { color: var(--gray-500); margin-top: 2px; font-size: 11px; }

/* =====================================================
   PWA 설치 배너 & iOS 가이드
   ===================================================== */
#pwa-install-banner {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--gray-900);
  color: #fff;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 900;
  box-shadow: 0 -4px 16px rgba(0,0,0,.2);
  transform: translateY(100%);
  transition: transform .3s ease;
}
#pwa-install-banner.show { transform: translateY(0); }
#pwa-install-banner .pwa-icon {
  width: 44px; height: 44px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
#pwa-install-banner .pwa-text h4 { font-size: 14px; font-weight: 700; }
#pwa-install-banner .pwa-text p  { font-size: 12px; color: var(--gray-400); }
#pwa-install-banner .pwa-actions { margin-left: auto; display: flex; gap: 8px; }
.btn-pwa-install {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-pwa-dismiss {
  background: transparent;
  color: var(--gray-400);
  border: 1px solid var(--gray-600);
  padding: 8px 12px;
  border-radius: var(--radius);
  font-size: 13px;
  cursor: pointer;
}

/* iOS 설치 가이드 */
.ios-guide-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}
.ios-step-num {
  width: 28px; height: 28px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}
.ios-guide-step .step-desc { font-size: 13px; color: var(--gray-700); }
.ios-guide-step .step-desc strong { color: var(--gray-900); }

/* =====================================================
   반응형
   ===================================================== */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
  .form-page-layout { grid-template-columns: 1fr; }
  .approval-line-panel { position: static; }
  .doc-detail-wrap { grid-template-columns: 1fr; }
  .admin-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  :root { --sidebar-w: 0px; }

  #sidebar {
    transform: translateX(-240px);
    width: 240px;
  }
  #sidebar.open {
    transform: translateX(0);
    box-shadow: var(--shadow-lg);
  }
  #sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.4);
    z-index: 199;
  }
  #sidebar-overlay.show { display: block; }

  #main-content { margin-left: 0; }
  #hamburger-btn { display: block; }

  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .stat-card { padding: 14px; }
  .stat-info .stat-num { font-size: 22px; }

  .page-container { padding: 16px; }

  .doc-meta-grid { grid-template-columns: repeat(2, 1fr); }
  .filter-bar { flex-direction: column; align-items: stretch; }
  .search-input-wrap { max-width: none; }

  .modal { max-width: 100%; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  .modal-overlay { align-items: flex-end; padding: 0; }

  .form-row { grid-template-columns: 1fr; }
  .admin-grid { grid-template-columns: 1fr; }

  #pwa-install-banner { flex-wrap: wrap; }
  #pwa-install-banner .pwa-actions { width: 100%; justify-content: flex-end; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .tab-btn { padding: 8px 12px; font-size: 12px; }
  .btn-lg { padding: 10px 16px; font-size: 14px; }
}

/* =====================================================
   인쇄 스타일
   ===================================================== */
@media print {
  #sidebar, #top-header, #pwa-install-banner, .form-actions,
  .filter-bar, .tab-bar, #toast-container { display: none !important; }
  #main-content { margin-left: 0; }
  .doc-paper { box-shadow: none; border: 1px solid #000; }
  body { background: #fff; }
}

/* =====================================================
   유틸리티
   ===================================================== */
.hidden { display: none !important; }
.text-center { text-align: center; }
.text-right  { text-align: right; }
.text-muted  { color: var(--gray-500); }
.text-small  { font-size: 12px; }
.font-bold   { font-weight: 700; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 16px; }
.mt-4 { margin-top: 24px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 16px; }
.gap-2 { gap: 8px; }
.flex  { display: flex; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.w-full { width: 100%; }

/* 연차 달력 스타일 */
.vac-date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}
.vac-date-range span { color: var(--gray-400); font-size: 13px; }
.vac-type-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.vac-type-btn {
  padding: 5px 12px;
  border: 1.5px solid var(--gray-200);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: #fff;
  color: var(--gray-600);
  cursor: pointer;
  transition: all var(--transition);
}
.vac-type-btn.active {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}
.vac-calc-result {
  background: var(--primary-light);
  border: 1px solid #bfdbfe;
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 13px;
  color: var(--primary-dark);
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 결재 처리 버튼 */
.approval-action-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 16px 0;
}
.btn-approve {
  background: var(--success);
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--transition);
}
.btn-approve:hover { background: #15803d; transform: translateY(-1px); }
.btn-reject {
  background: var(--danger);
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--transition);
}
.btn-reject:hover { background: #b91c1c; transform: translateY(-1px); }

/* 연번 현황 테이블 */
.seq-status-table th:first-child,
.seq-status-table td:first-child { width: 80px; }

/* 감사로그 */
.audit-log-item {
  padding: 10px 14px;
  border-bottom: 1px solid var(--gray-100);
  font-size: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.audit-log-item:hover { background: var(--gray-50); }
.audit-icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
}
.audit-info .audit-detail { color: var(--gray-700); }
.audit-info .audit-meta   { color: var(--gray-400); margin-top: 2px; }

/* 결재선 템플릿 */
.template-card {
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.template-card .tc-left { flex: 1; }
.template-card .tc-name { font-size: 14px; font-weight: 700; }
.template-card .tc-sub  { font-size: 12px; color: var(--gray-500); margin-top: 2px; }
.template-card .tc-actions { display: flex; gap: 6px; }

/* 구분선 섹션 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-header h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-800);
}

/* doc_no 배지 */
.doc-no-badge {
  font-size: 11px;
  background: var(--gray-100);
  color: var(--gray-600);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: 600;
}

/* =====================================================
   사이드바 내 정보 버튼
   ===================================================== */
.btn-my-info {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: var(--radius);
  color: rgba(255,255,255,.8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  text-align: left;
}
.btn-my-info:hover {
  background: rgba(255,255,255,.14);
  color: #fff;
}
.btn-my-info i { font-size: 14px; width: 18px; text-align: center; }

/* =====================================================
   내 정보 / 비밀번호 변경 모달
   ===================================================== */
.my-info-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--primary-light);
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
}
.my-info-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  flex-shrink: 0;
}
.my-info-meta .mi-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-900);
}
.my-info-meta .mi-sub {
  font-size: 13px;
  color: var(--gray-600);
  margin-top: 2px;
}
.my-info-meta .mi-empno {
  font-size: 11px;
  color: var(--gray-400);
  margin-top: 4px;
  font-family: monospace;
}
.my-info-divider {
  height: 1px;
  background: var(--gray-100);
  margin-bottom: 20px;
}
.my-info-section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--gray-700);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 비밀번호 입력 + 보기 버튼 */
.pw-input-wrap {
  position: relative;
}
.pw-input-wrap .form-control {
  padding-right: 44px;
}
.pw-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  transition: color var(--transition);
}
.pw-toggle:hover { color: var(--primary); }

/* 오류 메시지 */
.mi-error {
  background: var(--danger-light);
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  color: var(--danger);
  font-size: 13px;
  padding: 10px 14px;
  margin-top: 8px;
}

/* =====================================================
   연차 현황 배너 (연차신청서 폼)
   ===================================================== */
.vac-balance-banner {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0;
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
  border: 1.5px solid #bfdbfe;
  border-radius: var(--radius-lg);
  padding: 14px 20px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}
.vbb-item {
  flex: 1 1 0;
  text-align: center;
  min-width: 0;
}
.vbb-num {
  font-size: 26px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.1;
  letter-spacing: -0.5px;
}
.vbb-label {
  font-size: 11px;
  color: var(--gray-500);
  margin-top: 3px;
  font-weight: 500;
}
.vbb-divider {
  width: 1px;
  height: 40px;
  background: var(--gray-200);
  margin: 0 10px;
  flex-shrink: 0;
}
.vbb-year {
  position: absolute;
  top: 8px;
  right: 14px;
  font-size: 10px;
  color: var(--gray-400);
  font-weight: 500;
}

/* 연차 초과 경고 */
.vac-over-warn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff1f2;
  border: 1.5px solid #fecdd3;
  border-radius: var(--radius);
  color: var(--danger);
  font-size: 12px;
  font-weight: 600;
  padding: 8px 14px;
  margin-top: 8px;
}

/* =====================================================
   대시보드 연차 현황 카드
   ===================================================== */
.leave-status-card {
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 18px 22px;
  box-shadow: var(--shadow-sm);
}
.leave-status-card .lsc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.leave-status-card .lsc-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--gray-800);
  display: flex;
  align-items: center;
  gap: 6px;
}
.leave-status-card .lsc-year {
  font-size: 11px;
  color: var(--gray-400);
}
.leave-bar-wrap {
  margin-bottom: 6px;
}
.leave-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--gray-600);
  margin-bottom: 5px;
}
.leave-bar-label .lbl-remain {
  font-weight: 700;
  color: var(--primary);
}
.leave-bar-label .lbl-remain.danger {
  color: var(--danger);
}
.leave-bar-bg {
  width: 100%;
  height: 10px;
  background: var(--gray-100);
  border-radius: 6px;
  overflow: hidden;
}
.leave-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, #60a5fa 100%);
  border-radius: 6px;
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
}
.leave-bar-fill.danger {
  background: linear-gradient(90deg, var(--danger) 0%, #f87171 100%);
}
.leave-stat-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.leave-stat-box {
  flex: 1;
  min-width: 70px;
  background: var(--gray-50);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius);
  padding: 10px 8px;
  text-align: center;
}
.leave-stat-box .lsb-num {
  font-size: 20px;
  font-weight: 800;
  color: var(--gray-800);
}
.leave-stat-box .lsb-num.primary { color: var(--primary); }
.leave-stat-box .lsb-num.warning { color: var(--warning); }
.leave-stat-box .lsb-num.success { color: var(--success); }
.leave-stat-box .lsb-num.danger  { color: var(--danger); }
.leave-stat-box .lsb-label {
  font-size: 10px;
  color: var(--gray-500);
  margin-top: 2px;
}

/* 전사 연차 현황 테이블 (어드민) */
.leave-admin-table th, .leave-admin-table td {
  vertical-align: middle;
}
.leave-admin-table .progress-cell {
  min-width: 120px;
}
.leave-mini-bar-bg {
  width: 100%;
  height: 7px;
  background: var(--gray-100);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 3px;
}
.leave-mini-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, #60a5fa 100%);
  border-radius: 4px;
}
