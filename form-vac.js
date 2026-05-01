/* =====================================================
   js/app.js — 로그인 / 라우팅 / 모달 / 결재처리 / 알림
   ===================================================== */

'use strict';

/* ── 전역 상태 ── */
let currentUser = null;
let currentPage = 'dashboard';

/* =====================================================
   앱 초기화
   ===================================================== */
/* =====================================================
   기본 계정 자동 생성 (DB가 비어있을 때)
   ===================================================== */
const DEFAULT_USERS = [
  { emp_no: 'admin',  name: '이지숙', email: 'jisook@company.com',   password: 'admin', dept: '경영지원', position: '이사', role: 'ADMIN',    active: true, join_date: '2015-03-02' },
  { emp_no: 'EMP008', name: '박태성', email: 'taesang@company.com',  password: '1234',  dept: '경영지원', position: '대표', role: 'EMPLOYEE', active: true, join_date: '2010-01-01' },
  { emp_no: 'EMP001', name: '강대구', email: 'daegu@company.com',    password: '1234',  dept: '전기공사', position: '부장', role: 'MANAGER',  active: true, join_date: '2012-05-01' },
  { emp_no: 'EMP002', name: '최주원', email: 'juwon@company.com',    password: '1234',  dept: '전기공사', position: '주임', role: 'EMPLOYEE', active: true, join_date: '2021-03-02' },
  { emp_no: 'EMP003', name: '황시은', email: 'sieun@company.com',    password: '1234',  dept: '전기공사', position: '대리', role: 'EMPLOYEE', active: true, join_date: '2020-06-01' },
  { emp_no: 'EMP004', name: '김현빈', email: 'hyunbin@company.com',  password: '1234',  dept: '전기공사', position: '주임', role: 'EMPLOYEE', active: true, join_date: '2022-01-03' },
  { emp_no: 'EMP005', name: '김성환', email: 'sunghwan@company.com', password: '1234',  dept: '전기공사', position: '대리', role: 'EMPLOYEE', active: true, join_date: '2019-09-02' },
  { emp_no: 'EMP006', name: '이경동', email: 'kyungdong@company.com',password: '1234',  dept: '전기공사', position: '대리', role: 'EMPLOYEE', active: true, join_date: '2020-02-03' },
];

async function initDefaultUsers() {
  try {
    const existing = await getAllUsers();
    for (const def of DEFAULT_USERS) {
      const found = existing.find(u => u.emp_no === def.emp_no);
      if (!found) {
        await createUser(def);
        console.log(`[초기화] ${def.name} 계정 자동 생성`);
      }
    }
  } catch (e) {
    console.warn('[초기화] 기본 계정 생성 실패', e);
  }
}

/* =====================================================
   중복 사용자 자동 정리 (같은 emp_no 중 최신 1개만 유지)
   ===================================================== */
async function removeDuplicateUsers() {
  try {
    const all = await getAllUsers();
    const seen = {};
    for (const u of all) {
      const key = u.emp_no;
      if (!seen[key]) {
        seen[key] = u;
      } else {
        // 먼저 생성된 것(created_at 작은 것) 삭제 → 최신 것 유지
        const older = (seen[key].created_at || 0) <= (u.created_at || 0) ? seen[key] : u;
        const newer = older === seen[key] ? u : seen[key];
        await deleteUser(older.id);
        seen[key] = newer;
        console.log(`[중복제거] emp_no=${key} 중복 계정 삭제 완료`);
      }
    }
  } catch (e) {
    console.warn('[중복제거] 실패', e);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // 앱 시작 시 기본 계정 자동 생성 (DB가 비어있으면)
  await initDefaultUsers().catch(e => console.warn('[init-users]', e));
  // 앱 시작 시 중복 사용자 자동 정리 (백그라운드)
  removeDuplicateUsers().catch(e => console.warn('[dup-clean]', e));

  // 세션 복원 — DB에서 최신 정보로 갱신하여 emp_no 등 필드 보장
  const saved = sessionStorage.getItem('yes_user');
  if (saved) {
    try {
      const cached = JSON.parse(saved);
      // DB에서 최신 사용자 정보 재조회 (세션 캐시의 필드 누락 방지)
      try {
        const freshUser = await getUserById(cached.id);
        if (freshUser) {
          currentUser = freshUser;
          sessionStorage.setItem('yes_user', JSON.stringify(freshUser));
        } else {
          showLogin(); return;
        }
      } catch {
        // DB 조회 실패 시 캐시 그대로 사용
        currentUser = cached;
      }
      showApp();
      navigateTo(sessionStorage.getItem('yes_page') || 'dashboard');
    } catch { showLogin(); }
  } else {
    showLogin();
  }

  // 로그인 폼
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  // 로그아웃
  document.getElementById('btn-logout').addEventListener('click', handleLogout);

  // 햄버거 메뉴
  document.getElementById('hamburger-btn').addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

  // 사이드바 네비
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      navigateTo(el.dataset.page);
      closeSidebar();
    });
  });

  // 현재 날짜 표시
  document.getElementById('header-date').textContent = formatDate(new Date().toISOString());
});

/* =====================================================
   로그인 / 로그아웃
   ===================================================== */
async function handleLogin(e) {
  e.preventDefault();
  const id  = document.getElementById('login-id').value.trim();
  const pw  = document.getElementById('login-pw').value;
  const err = document.getElementById('login-error');
  const btn = document.getElementById('btn-login');

  err.classList.remove('show');
  btn.disabled = true;
  btn.textContent = '로그인 중...';

  try {
    // 계정이 없을 수 있으니 로그인 전에 기본 계정 초기화 보장
    await initDefaultUsers().catch(() => {});

    let user = await loginUser(id, pw);
    if (!user) {
      // 혹시 active 문제일 수 있으니 emp_no/password만으로 한번 더 직접 조회
      const allUsers = await fetchAll('users');
      user = allUsers.find(u =>
        (u.emp_no === id || u.email === id) && u.password === pw
      ) || null;
    }
    if (!user) {
      err.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
      err.classList.add('show');
      return;
    }
    // ── DB 최신 객체 그대로 저장 (emp_no, join_date 등 모든 필드 보장) ──
    currentUser = user;
    sessionStorage.setItem('yes_user', JSON.stringify(user));
    showApp();
    navigateTo('dashboard');

    // 로그인 알림 팝업 (0.6초 후)
    setTimeout(() => showLoginNotify(), 600);

    // 연차 잔여 자동 동기화 (백그라운드)
    syncLeaveBalancesIfNeeded().catch(e => console.warn('[leave sync]', e));

    // 감사로그
    writeAuditLog('LOGIN', user.id, user.name, '', `${user.name} 로그인`);
  } catch (err2) {
    err.textContent = '서버 연결 오류. 잠시 후 다시 시도해주세요.';
    err.classList.add('show');
    console.error(err2);
  } finally {
    btn.disabled = false;
    btn.textContent = '로그인';
  }
}

function handleLogout() {
  if (!confirm('로그아웃 하시겠습니까?')) return;
  writeAuditLog('LOGOUT', currentUser.id, currentUser.name, '', `${currentUser.name} 로그아웃`);
  stopApprovalPolling(); // 폴링 중지
  currentUser = null;
  sessionStorage.removeItem('yes_user');
  sessionStorage.removeItem('yes_page');
  showLogin();
}

/* =====================================================
   화면 전환
   ===================================================== */
function showLogin() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app-layout').style.display = 'none';
}

function showApp() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app-layout').style.display = 'flex';
  renderSidebarUser();
  updateAdminMenuVisibility();
  updateApprovalBadge();
  updateLeaveBadge();
  startApprovalPolling(); // 결재완료 실시간 폴링 시작
}

function renderSidebarUser() {
  if (!currentUser) return;
  document.getElementById('sidebar-user-name').textContent = currentUser.name;
  document.getElementById('sidebar-user-role').textContent =
    `${currentUser.dept} | ${currentUser.position}`;
  document.getElementById('sidebar-avatar').textContent = currentUser.name.charAt(0);
}

function updateAdminMenuVisibility() {
  const show = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER');
  document.querySelectorAll('.admin-section').forEach(el => {
    el.style.display = show ? '' : 'none';
  });
}

async function updateApprovalBadge() {
  if (!currentUser) return;
  try {
    const pending = await getPendingApprovals(currentUser.id);
    const badge = document.getElementById('approval-badge');
    if (pending.length > 0) {
      badge.textContent = pending.length;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  } catch {}
}

/* =====================================================
   결재 완료 실시간 알림 폴링
   - 30초마다 최근 승인/반려 문서 체크
   - 내가 처리하지 않은 새 완료 건이 있으면 팝업 표시
   ===================================================== */
let _lastApprovalCheckTs = Date.now();   // 마지막 체크 시각
let _approvalPollTimer   = null;         // setInterval 핸들

function startApprovalPolling() {
  if (_approvalPollTimer) clearInterval(_approvalPollTimer);
  // 로그인 시점 기준 5분 전부터 체크 (로그인 직후 이미 완료된 문서도 팝업 표시)
  _lastApprovalCheckTs = Date.now() - (5 * 60 * 1000);
  _approvalPollTimer = setInterval(checkNewApprovals, 30_000); // 30초
  // 로그인 직후 즉시 1회 체크 (3초 후)
  setTimeout(checkNewApprovals, 3000);
}

function stopApprovalPolling() {
  if (_approvalPollTimer) { clearInterval(_approvalPollTimer); _approvalPollTimer = null; }
}

async function checkNewApprovals() {
  if (!currentUser) return;
  try {
    const since = _lastApprovalCheckTs;
    _lastApprovalCheckTs = Date.now();

    const docs = await getAllDocuments();
    // 폴링 구간 내 APPROVED 또는 REJECTED 된 문서
    const newlyDone = docs.filter(d =>
      ['APPROVED', 'REJECTED'].includes(d.status) &&
      (d.updated_at || 0) >= since
    );

    if (!newlyDone.length) return;

    // 각 완료 문서에 대해 팝업 표시
    for (const doc of newlyDone) {
      showApprovalCompletePopup(doc);
    }

    // 결재 배지도 갱신
    await updateApprovalBadge();
  } catch (e) {
    console.warn('[poll]', e);
  }
}

function showApprovalCompletePopup(doc) {
  // 같은 문서 팝업 중복 방지
  const existId = `approval-popup-${doc.id}`;
  if (document.getElementById(existId)) return;

  const isApproved = doc.status === 'APPROVED';
  const isMyDoc    = doc.drafter_id === currentUser?.id;
  const typeLabel  = getDocTypeName(doc.doc_type);
  const statusTxt  = isApproved ? '✅ 승인 완료' : '❌ 반려';
  const bgColor    = isApproved ? 'var(--success)' : 'var(--danger)';

  // 내 문서 결과면 더 눈에 띄게
  const highlightStyle = isMyDoc
    ? 'border:2px solid var(--primary);box-shadow:0 8px 30px rgba(37,99,235,.25);'
    : 'border:1px solid var(--gray-200);box-shadow:0 4px 16px rgba(0,0,0,.12);';

  const popup = document.createElement('div');
  popup.id = existId;
  popup.style.cssText = `
    position:fixed;bottom:80px;right:20px;z-index:9999;
    background:#fff;border-radius:14px;padding:18px 20px;
    min-width:280px;max-width:340px;
    ${highlightStyle}
    animation:slideInRight .3s ease;
    font-family:inherit;
  `;
  popup.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="width:36px;height:36px;border-radius:50%;background:${bgColor};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">
        ${isApproved ? '<i class="fas fa-check" style="color:#fff"></i>' : '<i class="fas fa-times" style="color:#fff"></i>'}
      </div>
      <div>
        <div style="font-weight:700;font-size:14px;color:var(--gray-900)">${statusTxt}</div>
        <div style="font-size:12px;color:var(--gray-500);margin-top:2px">${typeLabel}</div>
      </div>
      <button onclick="document.getElementById('${existId}').remove()" style="margin-left:auto;background:none;border:none;font-size:18px;color:var(--gray-400);cursor:pointer;line-height:1;padding:0">×</button>
    </div>
    <div style="font-size:13px;color:var(--gray-700);font-weight:600;margin-bottom:4px">${doc.title}</div>
    <div style="font-size:12px;color:var(--gray-500)">
      기안자: ${doc.drafter_name} (${doc.drafter_dept})
      ${isMyDoc ? '<span style="color:var(--primary);font-weight:700"> · 내 문서</span>' : ''}
    </div>
    <button onclick="openDocDetail('${doc.id}');document.getElementById('${existId}').remove()" style="
      margin-top:12px;width:100%;padding:8px;
      background:var(--primary-light);border:1px solid var(--primary);border-radius:8px;
      color:var(--primary-dark);font-size:13px;font-weight:600;cursor:pointer;
    ">문서 보기 →</button>
  `;
  document.body.appendChild(popup);

  // 8초 후 자동 제거
  setTimeout(() => { if (document.getElementById(existId)) popup.remove(); }, 8000);
}

/* ── 사이드바 연차 잔여일 배지 업데이트 ── */
async function updateLeaveBadge() {
  if (!currentUser) return;
  const badge = document.getElementById('leave-badge');
  if (!badge) return;
  try {
    const year = todayYear();
    const bal  = await getLeaveBalance(currentUser.id, year);
    if (bal !== null && bal !== undefined) {
      const remain = bal.remain_days ?? 0;
      badge.textContent = `${remain}일`;
      badge.style.display = '';
      badge.style.background = remain <= 0 ? 'var(--danger)' : 'var(--success)';
    } else {
      badge.style.display = 'none';
    }
  } catch {
    badge.style.display = 'none';
  }
}

/* =====================================================
   라우팅 (SPA)
   ===================================================== */
async function navigateTo(page) {
  currentPage = page;
  sessionStorage.setItem('yes_page', page);

  // 모든 페이지 숨김
  document.querySelectorAll('.page-container').forEach(el => el.classList.remove('active'));
  // 해당 페이지 활성화
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.add('active');

  // 네비 활성화
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // 페이지 제목 업데이트
  const titles = {
    dashboard: '대시보드',
    'form-vac': '연차신청서',
    'form-ovt': '연장근무신청서',
    'my-docs': '내 문서함',
    'approval-box': '결재함',
    search: '통합조회',
    admin: '관리자 현황',
    'user-manage': '사용자 관리',
    templates: '결재선 템플릿',
    'audit-log': '감사로그'
  };
  document.getElementById('page-title').textContent = titles[page] || '예스결재';

  // 각 페이지 로드 함수 호출
  try {
    switch (page) {
      case 'dashboard':     await loadDashboard(); break;
      case 'form-vac':      await loadFormVac(); break;
      case 'form-ovt':      await loadFormOvt(); break;
      case 'my-docs':       await loadMyDocs(); break;
      case 'approval-box':  await loadApprovalBox(); break;
      case 'search':        await loadSearch(); break;
      case 'admin':         await loadAdmin(); break;
      case 'user-manage':   await loadUserManage(); break;
      case 'templates':     await loadTemplates(); break;
      case 'audit-log':     await loadAuditLog(); break;
    }
  } catch (err) {
    console.error(`[nav] ${page}:`, err);
    showToast('페이지 로드 중 오류가 발생했습니다.', 'error');
  }
}

/* =====================================================
   사이드바 토글 (모바일)
   ===================================================== */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

/* =====================================================
   토스트 알림
   ===================================================== */
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle',
                  warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-out');
    setTimeout(() => el.remove(), 280);
  }, duration);
}

/* =====================================================
   모달 유틸
   ===================================================== */
function openModal(overlayId) {
  document.getElementById(overlayId).classList.add('open');
}
function closeModal(overlayId) {
  document.getElementById(overlayId).classList.remove('open');
}
function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(el => el.classList.remove('open'));
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAllModals();
});

// 오버레이 클릭으로 모달 닫기
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

/* =====================================================
   문서 상세 모달 열기
   ===================================================== */
async function openDocDetail(docId) {
  try {
    showToast('문서를 불러오는 중...', 'info', 1200);
    const doc   = await getDocumentById(docId);
    const steps = await getStepsByDocId(docId);
    renderDocDetailModal(doc, steps);
    openModal('doc-detail-overlay');
  } catch (err) {
    showToast('문서 로드 실패: ' + err.message, 'error');
  }
}

function renderDocDetailModal(doc, steps) {
  const body = JSON.parse(doc.body || '{}');
  const isVac = doc.doc_type === 'VAC';

  // 헤더
  document.getElementById('detail-doc-type').textContent = getDocTypeName(doc.doc_type);
  document.getElementById('detail-doc-no').innerHTML =
    doc.doc_no ? `<span class="doc-no-badge">${doc.doc_no}</span>` : '';
  document.getElementById('detail-status').innerHTML = getStatusBadge(doc.status);

  // 기안 정보
  document.getElementById('detail-drafter').textContent =
    `${doc.drafter_name} (${doc.drafter_position} / ${doc.drafter_dept})`;
  document.getElementById('detail-submitted').textContent =
    doc.submitted_at ? formatDateTime(doc.submitted_at) : '임시저장';
  document.getElementById('detail-title').textContent = doc.title;

  // 문서 본문
  const bodyEl = document.getElementById('detail-body');
  if (isVac) {
    bodyEl.innerHTML = renderVacBody(body);
  } else {
    bodyEl.innerHTML = renderOvtBody(body);
  }

  // 결재선 타임라인
  const tlEl = document.getElementById('detail-timeline');
  tlEl.innerHTML = steps.map(s => renderTimelineItem(s)).join('');

  // 결재 처리 버튼 (내가 결재할 수 있을 때)
  const actionWrap = document.getElementById('detail-action-wrap');
  const myStep = steps.find(s => s.approver_id === currentUser?.id && s.status === 'WAITING');
  const canAct = myStep && doc.status === 'PENDING';

  actionWrap.innerHTML = '';
  if (canAct) {
    actionWrap.innerHTML = `
      <div class="approval-action-btns">
        <button class="btn-approve" onclick="handleApprove('${doc.id}')">
          <i class="fas fa-check"></i> 승인
        </button>
        <button class="btn-reject" onclick="promptReject('${doc.id}')">
          <i class="fas fa-times"></i> 반려
        </button>
      </div>`;
  }

  // 기안자 본인이고 DRAFT/PENDING 상태: 취소 버튼
  const isMyDoc = doc.drafter_id === currentUser?.id;
  if (isMyDoc && (doc.status === 'DRAFT' || doc.status === 'PENDING')) {
    actionWrap.innerHTML += `
      <div style="margin-top:10px;text-align:center">
        <button class="btn btn-outline btn-sm" onclick="handleCancelDoc('${doc.id}')">
          <i class="fas fa-ban"></i> 문서 취소
        </button>
        ${doc.status === 'DRAFT' ? `
        <button class="btn btn-primary btn-sm" style="margin-left:6px" onclick="editDraftDoc('${doc.id}','${doc.doc_type}');closeAllModals()">
          <i class="fas fa-edit"></i> 수정
        </button>` : ''}
      </div>`;
  }

  // 삭제 버튼 (ADMIN만)
  const deleteWrap = document.getElementById('detail-delete-wrap');
  deleteWrap.innerHTML = '';
  if (currentUser?.role === 'ADMIN') {
    deleteWrap.innerHTML = `
      <button class="btn btn-danger btn-sm" onclick="handleDeleteDoc('${doc.id}')">
        <i class="fas fa-trash"></i> 문서삭제
      </button>`;
  }
}

function renderVacBody(body) {
  return `
    <table class="data-table">
      <tbody>
        <tr><td class="text-muted" style="width:120px">휴가 유형</td><td><strong>${getVacTypeName(body.vac_type || '')}</strong></td></tr>
        <tr><td class="text-muted">휴가 기간</td><td>${body.start_date || ''} ~ ${body.end_date || ''}</td></tr>
        <tr><td class="text-muted">사용일수</td><td><strong>${body.days || 0}일</strong></td></tr>
        <tr><td class="text-muted">사유</td><td>${body.reason || '-'}</td></tr>
        ${body.contact ? `<tr><td class="text-muted">비상연락처</td><td>${body.contact}</td></tr>` : ''}
        ${body.backup_person ? `<tr><td class="text-muted">업무대행자</td><td>${body.backup_person}</td></tr>` : ''}
      </tbody>
    </table>`;
}

function renderOvtBody(body) {
  const workers = body.workers || [];
  return `
    <table class="data-table">
      <tbody>
        <tr><td class="text-muted" style="width:120px">연장근무일</td><td><strong>${body.work_date || ''}</strong></td></tr>
        <tr><td class="text-muted">근무 시간</td><td>${body.start_time || ''} ~ ${body.end_time || ''}</td></tr>
        <tr><td class="text-muted">근무 장소</td><td>${body.location || '-'}</td></tr>
        <tr><td class="text-muted">사유</td><td>${body.reason || '-'}</td></tr>
      </tbody>
    </table>
    ${workers.length ? `
    <div style="margin-top:16px">
      <p class="text-muted text-small mb-2">근무자 목록 (${workers.length}명)</p>
      <table class="data-table">
        <thead><tr><th>#</th><th>성명</th><th>부서</th><th>직급</th><th>시작</th><th>종료</th><th>시간</th></tr></thead>
        <tbody>
          ${workers.map((w, i) => `
            <tr>
              <td class="text-center">${i+1}</td>
              <td><strong>${w.name||''}</strong></td>
              <td>${w.dept||''}</td>
              <td>${w.position||''}</td>
              <td>${w.start_time||''}</td>
              <td>${w.end_time||''}</td>
              <td class="text-center">${w.hours||''}시간</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}`;
}

function renderTimelineItem(s) {
  const statusDot = {
    WAITING: `<i class="fas fa-clock" style="font-size:9px"></i>`,
    APPROVED:`<i class="fas fa-check" style="font-size:9px"></i>`,
    REJECTED:`<i class="fas fa-times" style="font-size:9px"></i>`,
    SKIPPED: `<i class="fas fa-minus" style="font-size:9px"></i>`
  };
  const dotClass = (s.status || '').toLowerCase();
  return `
    <div class="timeline-item">
      <div class="timeline-dot ${dotClass}">${statusDot[s.status] || ''}</div>
      <div class="timeline-content">
        <div class="tc-top">
          <div>
            <span class="tc-name">${s.approver_name}</span>
            <span class="tc-label ml-2">${s.label || ''} · ${s.approver_position}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            ${getStepStatusBadge(s.status)}
            ${s.acted_at ? `<span class="tc-date">${formatDateTime(s.acted_at)}</span>` : ''}
          </div>
        </div>
        ${s.comment ? `<div class="tc-comment">${s.comment}</div>` : ''}
      </div>
    </div>`;
}

/* =====================================================
   결재 처리
   ===================================================== */
async function handleApprove(docId) {
  const comment = prompt('결재 의견을 입력하세요 (선택사항):') || '';
  if (!confirm('승인 처리하시겠습니까?')) return;

  try {
    const result = await processApproval(docId, currentUser.id, 'APPROVE', comment);
    closeAllModals();
    if (result.result === 'APPROVED') {
      showToast('문서가 최종 승인되었습니다! 🎉', 'success', 4000);
      // 최종 승인 시 → 즉시 전체 완료 팝업 표시
      try {
        const completedDoc = await getDocumentById(docId);
        showApprovalCompletePopup(completedDoc);
      } catch {}
    } else {
      showToast('결재를 승인했습니다.', 'success');
    }
    await updateApprovalBadge();
    // 현재 페이지 새로고침
    await navigateTo(currentPage);
  } catch (err) {
    showToast('결재 처리 오류: ' + err.message, 'error');
  }
}

async function promptReject(docId) {
  const comment = prompt('반려 사유를 입력해주세요 (필수):');
  if (comment === null) return;
  if (!comment.trim()) {
    showToast('반려 사유를 입력해야 합니다.', 'warning');
    return;
  }
  if (!confirm(`반려 처리하시겠습니까?\n사유: ${comment}`)) return;

  try {
    await processApproval(docId, currentUser.id, 'REJECT', comment);
    closeAllModals();
    showToast('문서가 반려 처리되었습니다.', 'warning', 4000);
    // 반려 시에도 완료 팝업
    try {
      const rejectedDoc = await getDocumentById(docId);
      showApprovalCompletePopup(rejectedDoc);
    } catch {}
    await updateApprovalBadge();
    await navigateTo(currentPage);
  } catch (err) {
    showToast('반려 처리 오류: ' + err.message, 'error');
  }
}

/* =====================================================
   문서 삭제 (ADMIN만)
   ===================================================== */
async function handleDeleteDoc(docId) {
  if (currentUser?.role !== 'ADMIN') {
    showToast('관리자만 문서를 삭제할 수 있습니다.', 'error');
    return;
  }
  if (!confirm('이 문서를 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;

  try {
    // 결재 스텝 삭제
    const steps = await getStepsByDocId(docId);
    for (const s of steps) {
      await API.delete('approval_steps', s.id);
    }
    await deleteDocument(docId);
    closeAllModals();
    showToast('문서가 삭제되었습니다.', 'success');
    await writeAuditLog('DELETE', currentUser.id, currentUser.name, docId, '문서 삭제');
    await navigateTo(currentPage);
  } catch (err) {
    showToast('삭제 실패: ' + err.message, 'error');
  }
}

/* =====================================================
   문서 취소 (기안자 본인, DRAFT/PENDING)
   ===================================================== */
async function handleCancelDoc(docId) {
  if (!confirm('문서를 취소하시겠습니까?')) return;
  try {
    const doc = await getDocumentById(docId);
    await updateDocument(docId, { status: 'CANCELLED' });
    const steps = await getStepsByDocId(docId);
    const now = new Date().toISOString();
    for (const s of steps.filter(s => s.status === 'WAITING')) {
      await updateApprovalStep(s.id, { status: 'SKIPPED', acted_at: now });
    }

    // ── 연차신청서 취소 시 → 이미 승인 완료된 경우만 사용 일수 환원 ──
    if (doc && doc.doc_type === 'VAC' && doc.status === 'APPROVED') {
      try {
        const body = JSON.parse(doc.body || '{}');
        const days = body.days || 0;
        const year = doc.year || todayYear();
        if (days > 0) await restoreLeave(doc.drafter_id, year, days);
      } catch (e) { console.warn('[leave restore]', e); }
    }

    await writeAuditLog('CANCEL', currentUser.id, currentUser.name, docId, '문서 취소');
    closeAllModals();
    showToast('문서가 취소되었습니다.', 'warning');
    await navigateTo(currentPage);
  } catch (err) {
    showToast('취소 실패: ' + err.message, 'error');
  }
}

/* =====================================================
   로그인 알림 팝업 (showLoginNotify)
   ===================================================== */
async function showLoginNotify() {
  if (!currentUser) return;
  try {
    const [pendingDocs, myDocs, allDocs] = await Promise.all([
      getPendingApprovals(currentUser.id),
      getMyDocuments(currentUser.id),
      getAllDocuments()
    ]);

    // ① 내 결재 대기
    const waitingItems = pendingDocs.slice(0, 5);

    // ② 내 기안 문서 중 승인/반려된 것 (최근 7일)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const resultItems = myDocs
      .filter(d => ['APPROVED','REJECTED'].includes(d.status) &&
        (d.updated_at || 0) >= sevenDaysAgo)
      .slice(0, 5);

    // ③ 전사 최근 승인완료 (최근 3일)
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const recentApproved = allDocs
      .filter(d => d.status === 'APPROVED' && (d.updated_at || 0) >= threeDaysAgo)
      .sort((a,b) => (b.updated_at||0) - (a.updated_at||0))
      .slice(0, 5);

    // 팝업에 표시할 내용이 없으면 표시 안 함
    if (!waitingItems.length && !resultItems.length && !recentApproved.length) return;

    const popup = document.getElementById('login-notify');
    const body  = document.getElementById('notify-body');
    body.innerHTML = '';

    if (waitingItems.length) {
      body.innerHTML += `<div class="notify-section">
        <div class="notify-section-title">⏳ 내 결재 대기 (${waitingItems.length}건)</div>
        ${waitingItems.map(d => `
          <div class="notify-item highlight" onclick="openDocDetail('${d.id}');closeNotify()">
            <div class="ni-title">${getDocTypeName(d.doc_type)} — ${d.drafter_name}</div>
            <div class="ni-sub">${d.title} · ${formatDate(d.submitted_at)}</div>
          </div>`).join('')}
      </div>`;
    }

    if (resultItems.length) {
      body.innerHTML += `<div class="notify-section">
        <div class="notify-section-title">📋 내 기안 결과</div>
        ${resultItems.map(d => `
          <div class="notify-item" onclick="openDocDetail('${d.id}');closeNotify()">
            <div class="ni-title">${d.title} ${getStatusBadge(d.status)}</div>
            <div class="ni-sub">${getDocTypeName(d.doc_type)} · ${formatDateTime(d.updated_at)}</div>
          </div>`).join('')}
      </div>`;
    }

    if (recentApproved.length) {
      body.innerHTML += `<div class="notify-section">
        <div class="notify-section-title">✅ 최근 승인 완료</div>
        ${recentApproved.map(d => `
          <div class="notify-item" onclick="openDocDetail('${d.id}');closeNotify()">
            <div class="ni-title">${d.drafter_name} — ${d.title}</div>
            <div class="ni-sub">${getDocTypeName(d.doc_type)} · ${formatDateTime(d.updated_at)}</div>
          </div>`).join('')}
      </div>`;
    }

    popup.style.display = 'flex';
    popup.style.flexDirection = 'column';
  } catch (err) {
    console.warn('[notify]', err);
  }
}

function closeNotify() {
  document.getElementById('login-notify').style.display = 'none';
}

/* =====================================================
   문서 상신 공통 로직
   ===================================================== */
async function submitDocument(docType, title, bodyData, docId = null) {
  if (!currentUser) throw new Error('로그인이 필요합니다.');

  const year    = todayYear();
  const docNo   = await issueDocNo(docType, year);
  const now     = new Date().toISOString();

  // 결재라인 생성
  const approvalLine = await buildAutoApprovalLine(currentUser);

  const docData = {
    doc_type:          docType,
    doc_no:            docNo,
    title,
    drafter_id:        currentUser.id,
    drafter_name:      currentUser.name,
    drafter_dept:      currentUser.dept,
    drafter_position:  currentUser.position,
    status:            'PENDING',
    approval_line:     JSON.stringify(approvalLine),
    body:              JSON.stringify(bodyData),
    submitted_at:      now,
    year,
    seq:               parseInt(docNo.split('-')[2]) || 0
  };

  let savedDoc;
  if (docId) {
    savedDoc = await updateDocument(docId, docData);
    // 임시저장 → 상신: 기존 approval_steps가 있으면 모두 삭제 후 재생성
    const existingSteps = await getStepsByDocId(docId);
    for (const s of existingSteps) {
      await API.delete('approval_steps', s.id);
    }
  } else {
    savedDoc = await createDocument(docData);
  }

  // approval_steps 생성
  for (const step of approvalLine) {
    await createApprovalStep({
      doc_id:            savedDoc.id,
      step:              step.step,
      approver_id:       step.approver_id,
      approver_name:     step.approver_name,
      approver_dept:     step.approver_dept,
      approver_position: step.approver_position,
      label:             step.label,
      status:            'WAITING',
      is_ref:            false,
      acted_at:          '',
      comment:           ''
    });
  }

  await writeAuditLog('SUBMIT', currentUser.id, currentUser.name, savedDoc.id,
    `${title} 상신 (${docNo})`);
  await updateApprovalBadge();
  return savedDoc;
}

/* =====================================================
   내 정보 / 비밀번호 변경
   ===================================================== */
function openMyInfoModal() {
  if (!currentUser) return;

  // 프로필 채우기
  document.getElementById('mi-avatar').textContent = currentUser.name.charAt(0);
  document.getElementById('mi-name').textContent   = `${currentUser.name} (${currentUser.position})`;
  document.getElementById('mi-dept').textContent   = currentUser.dept;
  document.getElementById('mi-empno').textContent  = `사원번호: ${currentUser.emp_no}`;

  // 입력 초기화
  ['mi-pw-current','mi-pw-new','mi-pw-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const errEl = document.getElementById('mi-pw-error');
  if (errEl) errEl.style.display = 'none';

  openModal('my-info-overlay');
}

async function changePassword() {
  const current  = document.getElementById('mi-pw-current')?.value;
  const newPw    = document.getElementById('mi-pw-new')?.value;
  const confirm  = document.getElementById('mi-pw-confirm')?.value;
  const errEl    = document.getElementById('mi-pw-error');

  const showErr = (msg) => {
    errEl.textContent = msg;
    errEl.style.display = 'block';
  };
  errEl.style.display = 'none';

  // 유효성 검사
  if (!current || !newPw || !confirm) {
    showErr('모든 항목을 입력해주세요.');
    return;
  }
  if (current !== currentUser.password) {
    showErr('현재 비밀번호가 올바르지 않습니다.');
    return;
  }
  if (newPw.length < 4) {
    showErr('새 비밀번호는 4자 이상이어야 합니다.');
    return;
  }
  if (newPw !== confirm) {
    showErr('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
    return;
  }
  if (current === newPw) {
    showErr('현재 비밀번호와 동일한 비밀번호로는 변경할 수 없습니다.');
    return;
  }

  try {
    await updateUser(currentUser.id, { password: newPw });

    // 세션 정보 업데이트
    currentUser.password = newPw;
    sessionStorage.setItem('yes_user', JSON.stringify(currentUser));

    await writeAuditLog('UPDATE', currentUser.id, currentUser.name, '',
      `${currentUser.name} 비밀번호 변경`);

    closeModal('my-info-overlay');
    showToast('비밀번호가 변경되었습니다.', 'success');
  } catch (err) {
    showErr('변경 실패: ' + err.message);
  }
}

/* 비밀번호 표시/숨기기 토글 */
function togglePwVis(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  const icon = btn.querySelector('i');
  if (icon) {
    icon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
  }
}

async function saveDraftDocument(docType, title, bodyData, docId = null) {
  if (!currentUser) throw new Error('로그인이 필요합니다.');

  const docData = {
    doc_type:         docType,
    doc_no:           '',
    title,
    drafter_id:       currentUser.id,
    drafter_name:     currentUser.name,
    drafter_dept:     currentUser.dept,
    drafter_position: currentUser.position,
    status:           'DRAFT',
    approval_line:    '[]',
    body:             JSON.stringify(bodyData),
    submitted_at:     '',
    year:             todayYear(),
    seq:              0
  };

  if (docId) {
    return updateDocument(docId, docData);
  } else {
    return createDocument(docData);
  }
}
