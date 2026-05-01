/* =====================================================
   js/approval-box.js — 결재함
   ===================================================== */

'use strict';

let approvalBoxTab = 'waiting';
let approvalBoxPage = 1;
const APPROVAL_PAGE_SIZE = 10;

async function loadApprovalBox() {
  if (!currentUser) return;
  approvalBoxPage = 1;

  const container = document.getElementById('page-approval-box');
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title"><i class="fas fa-stamp"></i> 결재함</span>
      </div>
      <div class="card-body">
        <div class="tab-bar">
          <button class="tab-btn${approvalBoxTab==='waiting'?' active':''}"
            id="tab-waiting" onclick="switchApprovalTab('waiting')">
            <i class="fas fa-clock"></i> 결재 대기
            <span class="tab-count" id="waiting-count">-</span>
          </button>
          <button class="tab-btn${approvalBoxTab==='done'?' active':''}"
            id="tab-done" onclick="switchApprovalTab('done')">
            <i class="fas fa-check-double"></i> 처리 완료
            <span class="tab-count" id="done-count">-</span>
          </button>
        </div>
        <div id="approval-box-list">
          <div class="spinner-wrap"><div class="spinner"></div> 불러오는 중...</div>
        </div>
      </div>
    </div>`;

  await renderApprovalBoxList();
}

function switchApprovalTab(tab) {
  approvalBoxTab  = tab;
  approvalBoxPage = 1;
  document.querySelectorAll('#page-approval-box .tab-btn').forEach(btn => {
    btn.classList.toggle('active',
      (tab === 'waiting' && btn.id === 'tab-waiting') ||
      (tab === 'done'    && btn.id === 'tab-done')
    );
  });
  renderApprovalBoxList();
}

async function renderApprovalBoxList() {
  const el = document.getElementById('approval-box-list');
  if (!el) return;
  el.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  try {
    // 내 모든 결재 스텝 조회
    const allSteps = await fetchAll('approval_steps');
    const mySteps  = allSteps.filter(s => s.approver_id === currentUser.id);

    // 문서 목록
    const allDocs = await getAllDocuments();
    const docMap  = Object.fromEntries(allDocs.map(d => [d.id, d]));

    const waitingSteps = mySteps.filter(s => s.status === 'WAITING');
    const doneSteps    = mySteps.filter(s => s.status === 'APPROVED' || s.status === 'REJECTED');

    // 카운트 업데이트
    const waitingCount = waitingSteps.length;
    const doneCount    = doneSteps.length;
    const wc = document.getElementById('waiting-count');
    const dc = document.getElementById('done-count');
    if (wc) wc.textContent = waitingCount;
    if (dc) dc.textContent = doneCount;

    const targetSteps = approvalBoxTab === 'waiting' ? waitingSteps : doneSteps;

    // 유효한 문서와 매핑
    const items = targetSteps
      .map(s => ({ step: s, doc: docMap[s.doc_id] }))
      .filter(item => item.doc && (approvalBoxTab === 'waiting' ? item.doc.status === 'PENDING' : true))
      .sort((a, b) => {
        if (approvalBoxTab === 'waiting') {
          return (b.doc.submitted_at || '') > (a.doc.submitted_at || '') ? 1 : -1;
        }
        return (b.step.acted_at || '') > (a.step.acted_at || '') ? 1 : -1;
      });

    const total  = items.length;
    const start  = (approvalBoxPage - 1) * APPROVAL_PAGE_SIZE;
    const paged  = items.slice(start, start + APPROVAL_PAGE_SIZE);

    if (paged.length === 0) {
      el.innerHTML = `<div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>${approvalBoxTab === 'waiting' ? '결재 대기 문서가 없습니다' : '처리한 문서가 없습니다'}</p>
      </div>`;
      return;
    }

    el.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>문서유형</th>
              <th>문서번호</th>
              <th>제목</th>
              <th>기안자</th>
              <th>문서상태</th>
              ${approvalBoxTab === 'waiting'
                ? '<th>상신일</th><th class="text-center">작업</th>'
                : '<th>처리일</th><th>내 결정</th>'}
            </tr>
          </thead>
          <tbody>
            ${paged.map(({ step: s, doc: d }) => `
              <tr style="cursor:pointer" onclick="openDocDetail('${d.id}')">
                <td><span class="badge badge-primary">${getDocTypeName(d.doc_type)}</span></td>
                <td>${d.doc_no ? `<span class="doc-no-badge">${d.doc_no}</span>` : '-'}</td>
                <td><strong>${d.title || '(제목없음)'}</strong></td>
                <td>${d.drafter_name}<br><span class="text-muted text-small">${d.drafter_dept}</span></td>
                <td>${getStatusBadge(d.status)}</td>
                ${approvalBoxTab === 'waiting' ? `
                  <td class="text-muted">${formatDate(d.submitted_at)}</td>
                  <td class="text-center" onclick="event.stopPropagation()">
                    <div style="display:flex;gap:4px;justify-content:center">
                      <button class="btn btn-success btn-sm" onclick="handleApprove('${d.id}')">
                        <i class="fas fa-check"></i> 승인
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="promptReject('${d.id}')">
                        <i class="fas fa-times"></i> 반려
                      </button>
                    </div>
                  </td>` : `
                  <td class="text-muted">${formatDateTime(s.acted_at)}</td>
                  <td>${getStepStatusBadge(s.status)}
                    ${s.comment ? `<br><span class="text-small text-muted">${s.comment}</span>` : ''}
                  </td>`}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${renderApprovalPagination(total, approvalBoxPage, APPROVAL_PAGE_SIZE)}
      <p class="text-muted text-small text-center mt-2">총 ${total}건</p>`;
  } catch (err) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>로드 실패: ${err.message}</p></div>`;
  }
}

function renderApprovalPagination(total, currentPg, pageSize) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return '';

  let btns = '';
  const maxBtns = 7;
  let start = Math.max(1, currentPg - Math.floor(maxBtns / 2));
  let end   = Math.min(totalPages, start + maxBtns - 1);
  if (end - start < maxBtns - 1) start = Math.max(1, end - maxBtns + 1);

  btns += `<button class="page-btn" onclick="approvalBoxPage=${Math.max(1,currentPg-1)};renderApprovalBoxList()" ${currentPg===1?'disabled':''}>‹</button>`;
  for (let i = start; i <= end; i++) {
    btns += `<button class="page-btn${i===currentPg?' active':''}" onclick="approvalBoxPage=${i};renderApprovalBoxList()">${i}</button>`;
  }
  btns += `<button class="page-btn" onclick="approvalBoxPage=${Math.min(totalPages,currentPg+1)};renderApprovalBoxList()" ${currentPg===totalPages?'disabled':''}>›</button>`;

  return `<div class="pagination">${btns}</div>`;
}
