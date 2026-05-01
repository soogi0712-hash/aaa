/* =====================================================
   js/dashboard.js — 대시보드
   ===================================================== */

'use strict';

async function loadDashboard() {
  if (!currentUser) return;

  const container = document.getElementById('page-dashboard');
  const year = todayYear();

  container.innerHTML = `
    <div class="stats-grid" id="dash-stats">
      ${[0,1,2,3].map(() => `<div class="stat-card"><div class="spinner-wrap"><div class="spinner"></div></div></div>`).join('')}
    </div>
    <!-- 연차 현황 카드 -->
    <div id="dash-leave-wrap" style="margin-bottom:20px">
      <div class="spinner-wrap"><div class="spinner"></div></div>
    </div>
    <div class="dashboard-grid">
      <div class="card" id="dash-pending-card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-clock"></i> 결재 대기 문서</span>
        </div>
        <div class="card-body" id="dash-pending-list">
          <div class="spinner-wrap"><div class="spinner"></div> 불러오는 중...</div>
        </div>
      </div>
      <div class="card" id="dash-recent-card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-file-alt"></i> 최근 기안 문서</span>
        </div>
        <div class="card-body" id="dash-recent-list">
          <div class="spinner-wrap"><div class="spinner"></div> 불러오는 중...</div>
        </div>
      </div>
    </div>`;

  try {
    const [myDocs, pendingDocs, allDocs, leaveBalance] = await Promise.all([
      getMyDocuments(currentUser.id),
      getPendingApprovals(currentUser.id),
      currentUser.role !== 'EMPLOYEE' ? getAllDocuments() : Promise.resolve([]),
      getLeaveBalance(currentUser.id, year)
    ]);

    // ── 통계 카드 ──
    const total     = myDocs.length;
    const pending   = myDocs.filter(d => d.status === 'PENDING').length;
    const approved  = myDocs.filter(d => d.status === 'APPROVED').length;
    const draft     = myDocs.filter(d => d.status === 'DRAFT').length;

    document.getElementById('dash-stats').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-file-alt"></i></div>
        <div class="stat-info">
          <div class="stat-num">${total}</div>
          <div class="stat-label">전체 기안 문서</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow"><i class="fas fa-hourglass-half"></i></div>
        <div class="stat-info">
          <div class="stat-num">${pending}</div>
          <div class="stat-label">결재 진행 중</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
        <div class="stat-info">
          <div class="stat-num">${approved}</div>
          <div class="stat-label">승인 완료</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i class="fas fa-edit"></i></div>
        <div class="stat-info">
          <div class="stat-num">${draft}</div>
          <div class="stat-label">임시 저장</div>
        </div>
      </div>`;

    // ── 연차 현황 카드 ──
    renderDashLeaveCard(leaveBalance, year);

    // ── 결재 대기 목록 ──
    const pendingEl = document.getElementById('dash-pending-list');
    if (pendingDocs.length === 0) {
      pendingEl.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>결재 대기 문서가 없습니다</p></div>`;
    } else {
      pendingEl.innerHTML = `
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>문서유형</th><th>제목</th><th>기안자</th><th>상신일</th><th></th></tr></thead>
            <tbody>
              ${pendingDocs.slice(0, 10).map(d => `
                <tr>
                  <td><span class="badge badge-primary">${getDocTypeName(d.doc_type)}</span></td>
                  <td><strong>${d.title}</strong></td>
                  <td>${d.drafter_name}</td>
                  <td class="text-muted">${formatDate(d.submitted_at)}</td>
                  <td><button class="btn btn-primary btn-sm" onclick="openDocDetail('${d.id}')"><i class="fas fa-stamp"></i> 결재</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        ${pendingDocs.length > 10 ? `<p class="text-center text-muted mt-2" style="font-size:12px">외 ${pendingDocs.length - 10}건 더 있습니다. <a href="#" onclick="navigateTo('approval-box');return false;" style="color:var(--primary)">결재함 이동 →</a></p>` : ''}`;
    }

    // ── 최근 기안 문서 ──
    const recentEl = document.getElementById('dash-recent-list');
    const recentDocs = myDocs
      .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
      .slice(0, 8);

    if (recentDocs.length === 0) {
      recentEl.innerHTML = `<div class="empty-state"><i class="fas fa-file-circle-plus"></i><p>기안한 문서가 없습니다</p><small>연차 또는 연장근무 신청서를 작성해보세요</small></div>`;
    } else {
      recentEl.innerHTML = `
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>문서유형</th><th>문서번호</th><th>제목</th><th>상태</th><th>기안일</th></tr></thead>
            <tbody>
              ${recentDocs.map(d => `
                <tr style="cursor:pointer" onclick="openDocDetail('${d.id}')">
                  <td><span class="badge badge-primary">${getDocTypeName(d.doc_type)}</span></td>
                  <td>${d.doc_no ? `<span class="doc-no-badge">${d.doc_no}</span>` : '<span class="text-muted">-</span>'}</td>
                  <td><strong>${d.title}</strong></td>
                  <td>${getStatusBadge(d.status)}</td>
                  <td class="text-muted">${formatDate(d.created_at)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }

  } catch (err) {
    console.error('[dashboard]', err);
    showToast('대시보드 로드 실패', 'error');
  }
}

/* ── 연차 현황 카드 렌더링 ── */
function renderDashLeaveCard(bal, year) {
  const el = document.getElementById('dash-leave-wrap');
  if (!el) return;

  if (!bal) {
    el.innerHTML = `
      <div class="leave-status-card">
        <div class="lsc-header">
          <span class="lsc-title"><i class="fas fa-calendar-check" style="color:var(--primary)"></i> 내 연차 현황</span>
          <span class="lsc-year">${year}년</span>
        </div>
        <div class="empty-state" style="padding:16px 0">
          <i class="fas fa-info-circle"></i>
          <p style="font-size:12px">연차 데이터가 없습니다.<br>관리자에게 입사일 등록을 요청하세요.</p>
        </div>
      </div>`;
    return;
  }

  const total  = bal.total_days  || 0;
  const used   = bal.used_days   || 0;
  const remain = bal.remain_days ?? Math.max(total - used, 0);
  const pct    = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;
  const isDanger = remain <= 0;

  el.innerHTML = `
    <div class="leave-status-card">
      <div class="lsc-header">
        <span class="lsc-title">
          <i class="fas fa-calendar-check" style="color:var(--primary)"></i>
          내 연차 현황
        </span>
        <span class="lsc-year">${year}년</span>
      </div>

      <!-- 진행 바 -->
      <div class="leave-bar-wrap">
        <div class="leave-bar-label">
          <span>사용 ${used}일 / 발생 ${total}일</span>
          <span class="lbl-remain ${isDanger ? 'danger' : ''}">
            잔여 <strong>${remain}</strong>일
          </span>
        </div>
        <div class="leave-bar-bg">
          <div class="leave-bar-fill ${isDanger ? 'danger' : ''}"
               style="width:${pct}%"></div>
        </div>
      </div>

      <!-- 수치 카드 3개 -->
      <div class="leave-stat-row">
        <div class="leave-stat-box">
          <div class="lsb-num primary">${total}</div>
          <div class="lsb-label">발생 연차</div>
        </div>
        <div class="leave-stat-box">
          <div class="lsb-num warning">${used}</div>
          <div class="lsb-label">사용 연차</div>
        </div>
        <div class="leave-stat-box">
          <div class="lsb-num ${isDanger ? 'danger' : 'success'}">${remain}</div>
          <div class="lsb-label">잔여 연차</div>
        </div>
        <div class="leave-stat-box">
          <div class="lsb-num" style="font-size:14px;color:var(--gray-500)">${pct}%</div>
          <div class="lsb-label">사용률</div>
        </div>
      </div>

      <div style="margin-top:12px;text-align:right">
        <button class="btn btn-outline btn-sm" onclick="navigateTo('form-vac')" style="font-size:11px">
          <i class="fas fa-plus"></i> 연차 신청
        </button>
      </div>
    </div>`;
}
