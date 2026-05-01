/* =====================================================
   js/my-docs.js — 내 문서함
   ===================================================== */

'use strict';

let myDocsFilter = 'ALL';
let myDocsSearch = '';
let myDocsPage   = 1;
const MY_DOCS_PAGE_SIZE = 10;

async function loadMyDocs() {
  if (!currentUser) return;
  myDocsPage = 1;
  renderMyDocsPage();
}

async function renderMyDocsPage() {
  const container = document.getElementById('page-my-docs');
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title"><i class="fas fa-folder-open"></i> 내 문서함</span>
        <div class="header-actions">
          <button class="btn btn-primary btn-sm" onclick="navigateTo('form-vac')">
            <i class="fas fa-plus"></i> 연차신청
          </button>
          <button class="btn btn-outline btn-sm" onclick="navigateTo('form-ovt')">
            <i class="fas fa-plus"></i> 연장근무신청
          </button>
        </div>
      </div>
      <div class="card-body">
        <!-- 필터 -->
        <div class="filter-bar">
          <div class="tab-bar" style="border:none;margin-bottom:0">
            ${['ALL','DRAFT','PENDING','APPROVED','REJECTED','CANCELLED'].map(s => `
              <button class="tab-btn${myDocsFilter === s ? ' active' : ''}"
                onclick="setMyDocsFilter('${s}')">
                ${getStatusLabel(s)}
              </button>`).join('')}
          </div>
          <div class="search-input-wrap" style="margin-left:auto">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="제목, 문서번호 검색..."
              value="${myDocsSearch}"
              oninput="myDocsSearch=this.value;myDocsPage=1;renderMyDocsList()">
          </div>
        </div>
        <div id="my-docs-list">
          <div class="spinner-wrap"><div class="spinner"></div> 불러오는 중...</div>
        </div>
      </div>
    </div>`;

  await renderMyDocsList();
}

async function renderMyDocsList() {
  const el = document.getElementById('my-docs-list');
  if (!el) return;
  el.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  try {
    let docs = await getMyDocuments(currentUser.id);

    // 필터
    if (myDocsFilter !== 'ALL') {
      docs = docs.filter(d => d.status === myDocsFilter);
    }
    // 검색
    if (myDocsSearch.trim()) {
      const q = myDocsSearch.trim().toLowerCase();
      docs = docs.filter(d =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.doc_no || '').toLowerCase().includes(q)
      );
    }

    // 정렬 (최신순)
    docs.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

    const total = docs.length;
    const start = (myDocsPage - 1) * MY_DOCS_PAGE_SIZE;
    const paged = docs.slice(start, start + MY_DOCS_PAGE_SIZE);

    if (paged.length === 0) {
      el.innerHTML = `<div class="empty-state">
        <i class="fas fa-file-alt"></i>
        <p>문서가 없습니다</p>
        <small>조건을 변경하거나 새 문서를 작성해보세요</small>
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
              <th>상태</th>
              <th>기안일</th>
              <th>처리일</th>
              <th class="text-center">작업</th>
            </tr>
          </thead>
          <tbody>
            ${paged.map(d => `
              <tr style="cursor:pointer" onclick="openDocDetail('${d.id}')">
                <td><span class="badge badge-primary">${getDocTypeName(d.doc_type)}</span></td>
                <td>${d.doc_no ? `<span class="doc-no-badge">${d.doc_no}</span>` : '<span class="text-muted text-small">-</span>'}</td>
                <td><strong>${d.title || '(제목없음)'}</strong></td>
                <td>${getStatusBadge(d.status)}</td>
                <td class="text-muted">${formatDate(d.created_at)}</td>
                <td class="text-muted">${d.status === 'APPROVED' || d.status === 'REJECTED' ? formatDate(d.updated_at) : '-'}</td>
                <td class="text-center" onclick="event.stopPropagation()">
                  <div style="display:flex;gap:4px;justify-content:center">
                    ${d.status === 'DRAFT' ? `
                      <button class="btn btn-primary btn-sm"
                        onclick="editDraftDoc('${d.id}','${d.doc_type}')">
                        <i class="fas fa-edit"></i> 수정
                      </button>` : ''}
                    ${(d.status === 'DRAFT' || d.status === 'PENDING') ? `
                      <button class="btn btn-outline btn-sm"
                        onclick="handleCancelDoc('${d.id}')">
                        <i class="fas fa-ban"></i> 취소
                      </button>` : ''}
                    ${currentUser.role === 'ADMIN' ? `
                      <button class="btn btn-danger btn-sm"
                        onclick="handleDeleteDoc('${d.id}')">
                        <i class="fas fa-trash"></i>
                      </button>` : ''}
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${renderPagination(total, myDocsPage, MY_DOCS_PAGE_SIZE, 'myDocsPage')}
      <p class="text-muted text-small text-center mt-2">총 ${total}건</p>`;
  } catch (err) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>로드 실패: ${err.message}</p></div>`;
  }
}

function setMyDocsFilter(status) {
  myDocsFilter = status;
  myDocsPage = 1;
  // 탭 버튼 활성화
  document.querySelectorAll('#page-my-docs .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === getStatusLabel(status));
  });
  renderMyDocsList();
}

function getStatusLabel(s) {
  return { ALL:'전체', DRAFT:'임시저장', PENDING:'결재중', APPROVED:'승인완료', REJECTED:'반려', CANCELLED:'취소' }[s] || s;
}

function editDraftDoc(docId, docType) {
  if (docType === 'VAC') {
    loadFormVac(docId);
    navigateTo('form-vac');
  } else {
    loadFormOvt(docId);
    navigateTo('form-ovt');
  }
}

/* ── 페이지네이션 렌더 유틸 ── */
function renderPagination(total, currentPg, pageSize, pageVarName) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return '';

  let btns = '';
  const maxBtns = 7;
  let start = Math.max(1, currentPg - Math.floor(maxBtns / 2));
  let end   = Math.min(totalPages, start + maxBtns - 1);
  if (end - start < maxBtns - 1) start = Math.max(1, end - maxBtns + 1);

  btns += `<button class="page-btn" onclick="${pageVarName}=${Math.max(1,currentPg-1)};renderMyDocsList()" ${currentPg===1?'disabled':''}>‹</button>`;
  for (let i = start; i <= end; i++) {
    btns += `<button class="page-btn${i===currentPg?' active':''}" onclick="${pageVarName}=${i};renderMyDocsList()">${i}</button>`;
  }
  btns += `<button class="page-btn" onclick="${pageVarName}=${Math.min(totalPages,currentPg+1)};renderMyDocsList()" ${currentPg===totalPages?'disabled':''}>›</button>`;

  return `<div class="pagination">${btns}</div>`;
}
