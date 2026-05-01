/* =====================================================
   js/search.js — 통합조회
   ===================================================== */

'use strict';

let searchFilter = { status: 'ALL', docType: 'ALL', keyword: '', year: '' };
let searchPage   = 1;
const SEARCH_PAGE_SIZE = 15;

async function loadSearch() {
  if (!currentUser) return;
  searchPage = 1;
  searchFilter.year = todayYear();

  const container = document.getElementById('page-search');
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">
          <i class="fas fa-search"></i>
          통합조회
          ${!isAdmin ? '<span class="badge badge-primary" style="font-size:11px;margin-left:6px">본인 관련 문서만</span>' : ''}
        </span>
      </div>
      <div class="card-body">
        <!-- 검색 필터 -->
        <div class="filter-bar">
          <div class="search-input-wrap">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="제목, 문서번호, 기안자 검색..."
              value="${searchFilter.keyword}"
              oninput="searchFilter.keyword=this.value;searchPage=1;renderSearchList()">
          </div>
          <select class="form-control" style="width:120px"
            onchange="searchFilter.docType=this.value;searchPage=1;renderSearchList()">
            <option value="ALL" ${searchFilter.docType==='ALL'?'selected':''}>전체 유형</option>
            <option value="VAC" ${searchFilter.docType==='VAC'?'selected':''}>연차신청서</option>
            <option value="OVT" ${searchFilter.docType==='OVT'?'selected':''}>연장근무신청서</option>
          </select>
          <select class="form-control" style="width:110px"
            onchange="searchFilter.status=this.value;searchPage=1;renderSearchList()">
            <option value="ALL">전체 상태</option>
            <option value="DRAFT">임시저장</option>
            <option value="PENDING">결재중</option>
            <option value="APPROVED">승인완료</option>
            <option value="REJECTED">반려</option>
            <option value="CANCELLED">취소</option>
          </select>
          <select class="form-control" style="width:90px"
            onchange="searchFilter.year=this.value;searchPage=1;renderSearchList()">
            ${[todayYear(), String(Number(todayYear())-1), String(Number(todayYear())-2)].map(y =>
              `<option value="${y}" ${searchFilter.year===y?'selected':''}>${y}년</option>`
            ).join('')}
            <option value="">전체 연도</option>
          </select>
          <button class="btn btn-outline btn-sm" onclick="searchFilter={status:'ALL',docType:'ALL',keyword:'',year:todayYear()};searchPage=1;loadSearch()">
            <i class="fas fa-undo"></i> 초기화
          </button>
        </div>
        <div id="search-result-list">
          <div class="spinner-wrap"><div class="spinner"></div> 검색 중...</div>
        </div>
      </div>
    </div>`;

  await renderSearchList();
}

async function renderSearchList() {
  const el = document.getElementById('search-result-list');
  if (!el) return;
  el.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  try {
    const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';
    let docs = await getAllDocuments();

    // 권한에 따른 필터
    if (!isAdmin) {
      // 일반 직원: 본인 기안 OR 결재라인에 포함된 문서
      const mySteps = await fetchAll('approval_steps');
      const myDocIds = new Set(mySteps.filter(s => s.approver_id === currentUser.id).map(s => s.doc_id));
      docs = docs.filter(d => d.drafter_id === currentUser.id || myDocIds.has(d.id));
    }

    // 연도 필터
    if (searchFilter.year) {
      docs = docs.filter(d => (d.year || '') === searchFilter.year);
    }
    // 상태 필터
    if (searchFilter.status !== 'ALL') {
      docs = docs.filter(d => d.status === searchFilter.status);
    }
    // 문서 유형 필터
    if (searchFilter.docType !== 'ALL') {
      docs = docs.filter(d => d.doc_type === searchFilter.docType);
    }
    // 키워드 검색
    if (searchFilter.keyword.trim()) {
      const q = searchFilter.keyword.trim().toLowerCase();
      docs = docs.filter(d =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.doc_no || '').toLowerCase().includes(q) ||
        (d.drafter_name || '').toLowerCase().includes(q) ||
        (d.drafter_dept || '').toLowerCase().includes(q)
      );
    }

    // 정렬 (최신순)
    docs.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

    const total = docs.length;
    const start = (searchPage - 1) * SEARCH_PAGE_SIZE;
    const paged = docs.slice(start, start + SEARCH_PAGE_SIZE);

    if (paged.length === 0) {
      el.innerHTML = `<div class="empty-state">
        <i class="fas fa-search"></i>
        <p>검색 결과가 없습니다</p>
        <small>검색 조건을 변경해보세요</small>
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
              <th>부서</th>
              <th>상태</th>
              <th>기안일</th>
              <th>처리일</th>
            </tr>
          </thead>
          <tbody>
            ${paged.map(d => `
              <tr style="cursor:pointer" onclick="openDocDetail('${d.id}')">
                <td><span class="badge badge-primary">${getDocTypeName(d.doc_type)}</span></td>
                <td>${d.doc_no ? `<span class="doc-no-badge">${d.doc_no}</span>` : '<span class="text-muted">-</span>'}</td>
                <td><strong>${d.title || '(제목없음)'}</strong></td>
                <td>${d.drafter_name || '-'}</td>
                <td class="text-muted">${d.drafter_dept || '-'}</td>
                <td>${getStatusBadge(d.status)}</td>
                <td class="text-muted">${formatDate(d.created_at)}</td>
                <td class="text-muted">${['APPROVED','REJECTED'].includes(d.status) ? formatDate(d.updated_at) : '-'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${renderSearchPagination(total, searchPage, SEARCH_PAGE_SIZE)}
      <p class="text-muted text-small text-center mt-2">총 ${total}건</p>`;

  } catch (err) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>로드 실패: ${err.message}</p></div>`;
  }
}

function renderSearchPagination(total, currentPg, pageSize) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return '';
  let btns = '';
  const maxBtns = 7;
  let start = Math.max(1, currentPg - Math.floor(maxBtns / 2));
  let end   = Math.min(totalPages, start + maxBtns - 1);
  if (end - start < maxBtns - 1) start = Math.max(1, end - maxBtns + 1);
  btns += `<button class="page-btn" onclick="searchPage=${Math.max(1,currentPg-1)};renderSearchList()" ${currentPg===1?'disabled':''}>‹</button>`;
  for (let i = start; i <= end; i++) {
    btns += `<button class="page-btn${i===currentPg?' active':''}" onclick="searchPage=${i};renderSearchList()">${i}</button>`;
  }
  btns += `<button class="page-btn" onclick="searchPage=${Math.min(totalPages,currentPg+1)};renderSearchList()" ${currentPg===totalPages?'disabled':''}>›</button>`;
  return `<div class="pagination">${btns}</div>`;
}
