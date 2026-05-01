/* =====================================================
   js/admin.js — 관리자 현황 / 사용자관리 / 템플릿 / 감사로그
   ===================================================== */

'use strict';

/* =====================================================
   관리자 현황 (loadAdmin)
   ===================================================== */
async function loadAdmin() {
  if (!currentUser) return;
  const container = document.getElementById('page-admin');
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div> 불러오는 중...</div>`;

  try {
    const [allDocs, allUsers, seqStatus, allLeave] = await Promise.all([
      getAllDocuments(),
      getAllUsers(),
      getDocSeqStatus(),
      getAllLeaveBalances(todayYear())
    ]);

    const year = todayYear();
    const thisYearDocs = allDocs.filter(d => d.year === year);

    const totalDocs     = allDocs.length;
    const pendingDocs   = allDocs.filter(d => d.status === 'PENDING').length;
    const approvedDocs  = allDocs.filter(d => d.status === 'APPROVED').length;
    const activeUsers   = allUsers.filter(u => u.active).length;

    container.innerHTML = `
      <!-- 요약 카드 -->
      <div class="admin-grid">
        <div class="summary-card">
          <div class="sc-num">${totalDocs}</div>
          <div class="sc-label">전체 문서</div>
        </div>
        <div class="summary-card">
          <div class="sc-num" style="color:var(--warning)">${pendingDocs}</div>
          <div class="sc-label">결재 진행 중</div>
        </div>
        <div class="summary-card">
          <div class="sc-num" style="color:var(--success)">${approvedDocs}</div>
          <div class="sc-label">승인 완료</div>
        </div>
        <div class="summary-card">
          <div class="sc-num" style="color:var(--primary)">${activeUsers}</div>
          <div class="sc-label">활성 사용자</div>
        </div>
        <div class="summary-card">
          <div class="sc-num">${thisYearDocs.filter(d=>d.doc_type==='VAC').length}</div>
          <div class="sc-label">${year}년 연차 신청</div>
        </div>
        <div class="summary-card">
          <div class="sc-num">${thisYearDocs.filter(d=>d.doc_type==='OVT').length}</div>
          <div class="sc-label">${year}년 연장근무 신청</div>
        </div>
      </div>

      <!-- 연번 현황 -->
      <div class="card mb-3" style="margin-bottom:20px">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-list-ol"></i> 연도별 연번 현황</span>
        </div>
        <div class="card-body">
          ${seqStatus.length === 0
            ? `<p class="text-muted text-center">아직 발급된 문서번호가 없습니다.</p>`
            : `<table class="data-table seq-status-table">
                <thead><tr><th>문서유형</th><th>연도</th><th>마지막 연번</th><th>발급 건수</th></tr></thead>
                <tbody>
                  ${seqStatus
                    .sort((a,b) => (b.year||'').localeCompare(a.year||'') || (a.doc_type||'').localeCompare(b.doc_type||''))
                    .map(s => `
                    <tr>
                      <td><span class="badge badge-primary">${getDocTypeName(s.doc_type)}</span></td>
                      <td><strong>${s.year}</strong></td>
                      <td><span class="doc-no-badge">${s.doc_type}-${s.year}-${String(s.last_seq||0).padStart(6,'0')}</span></td>
                      <td>${s.last_seq || 0}건</td>
                    </tr>`).join('')}
                </tbody>
              </table>`
          }
        </div>
      </div>

      <!-- 전사 연차 현황 -->
      <div class="card mb-3" style="margin-bottom:20px">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-umbrella-beach"></i> 전사 연차 현황 (${year}년)</span>
        </div>
        <div class="card-body">
          ${renderLeaveStats(allUsers, allLeave, year)}
        </div>
      </div>

      <!-- 부서별 문서 현황 -->
      <div class="card mb-3" style="margin-bottom:20px">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-chart-bar"></i> 부서별 문서 현황 (${year}년)</span>
        </div>
        <div class="card-body">
          ${renderDeptStats(thisYearDocs)}
        </div>
      </div>

      <!-- 최근 문서 목록 -->
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-file-alt"></i> 최근 기안 문서</span>
          <button class="btn btn-outline btn-sm" onclick="navigateTo('search')">
            <i class="fas fa-search"></i> 전체조회
          </button>
        </div>
        <div class="card-body">
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>유형</th><th>문서번호</th><th>제목</th><th>기안자</th><th>상태</th><th>기안일</th></tr>
              </thead>
              <tbody>
                ${allDocs
                  .sort((a,b) => (b.created_at||0) - (a.created_at||0))
                  .slice(0, 15)
                  .map(d => `
                  <tr style="cursor:pointer" onclick="openDocDetail('${d.id}')">
                    <td><span class="badge badge-primary">${getDocTypeName(d.doc_type)}</span></td>
                    <td>${d.doc_no ? `<span class="doc-no-badge">${d.doc_no}</span>` : '-'}</td>
                    <td><strong>${d.title||'(제목없음)'}</strong></td>
                    <td>${d.drafter_name} <span class="text-muted">${d.drafter_dept}</span></td>
                    <td>${getStatusBadge(d.status)}</td>
                    <td class="text-muted">${formatDate(d.created_at)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>로드 실패: ${err.message}</p></div>`;
  }
}

function renderLeaveStats(users, leaveData, year) {
  // admin 계정 제외, 활성 직원만
  const activeUsers = users.filter(u => u.active && u.emp_no !== 'admin');
  if (!activeUsers.length) return '<p class="text-muted text-center">직원 데이터가 없습니다.</p>';

  // 직급 순서대로 정렬 (높은 직급 → 낮은 직급)
  const RANK = { '대표':8,'이사':7,'부장':6,'차장':5,'과장':4,'대리':3,'주임':2,'사원':1 };
  activeUsers.sort((a, b) => (RANK[b.position]||0) - (RANK[a.position]||0) || (a.name||'').localeCompare(b.name||''));

  return `
    <div class="table-wrap">
      <table class="data-table leave-admin-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>직급</th>
            <th>부서</th>
            <th class="text-center">발생</th>
            <th class="text-center">사용</th>
            <th class="text-center" style="color:var(--primary)">잔여</th>
            <th class="progress-cell">사용률</th>
          </tr>
        </thead>
        <tbody>
          ${activeUsers.map(u => {
            const bal = leaveData.find(b => b.user_id === u.id) || null;
            const total  = bal?.total_days  ?? '—';
            const used   = bal?.used_days   ?? '—';
            const remain = bal?.remain_days ?? '—';
            const pct    = (bal && bal.total_days > 0)
              ? Math.min(Math.round((bal.used_days / bal.total_days) * 100), 100) : 0;
            const isDanger = bal && bal.remain_days <= 0;
            return `
              <tr>
                <td><strong>${u.name}</strong></td>
                <td><span class="badge badge-primary" style="font-size:10px">${u.position}</span></td>
                <td class="text-muted">${u.dept}</td>
                <td class="text-center">${total}</td>
                <td class="text-center" style="color:var(--warning)">${used}</td>
                <td class="text-center font-bold ${isDanger ? 'text-danger' : ''}" style="color:${isDanger?'var(--danger)':'var(--success)'}">
                  <strong>${remain}</strong>
                </td>
                <td class="progress-cell">
                  ${bal ? `
                    <div style="font-size:11px;color:var(--gray-500);margin-bottom:3px">${pct}%</div>
                    <div class="leave-mini-bar-bg">
                      <div class="leave-mini-bar-fill" style="width:${pct}%;${isDanger?'background:var(--danger)':''}"></div>
                    </div>` : '<span class="text-muted" style="font-size:11px">데이터 없음</span>'}
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderDeptStats(docs) {
  if (!docs.length) return '<p class="text-muted text-center">데이터가 없습니다.</p>';
  const deptMap = {};
  docs.forEach(d => {
    const dept = d.drafter_dept || '미분류';
    if (!deptMap[dept]) deptMap[dept] = { total:0, vac:0, ovt:0, approved:0, pending:0 };
    deptMap[dept].total++;
    if (d.doc_type === 'VAC') deptMap[dept].vac++;
    if (d.doc_type === 'OVT') deptMap[dept].ovt++;
    if (d.status === 'APPROVED') deptMap[dept].approved++;
    if (d.status === 'PENDING')  deptMap[dept].pending++;
  });
  return `
    <table class="data-table">
      <thead>
        <tr><th>부서</th><th class="text-center">전체</th><th class="text-center">연차</th><th class="text-center">연장근무</th><th class="text-center">승인</th><th class="text-center">진행중</th></tr>
      </thead>
      <tbody>
        ${Object.entries(deptMap).map(([dept, s]) => `
          <tr>
            <td><strong>${dept}</strong></td>
            <td class="text-center">${s.total}</td>
            <td class="text-center">${s.vac}</td>
            <td class="text-center">${s.ovt}</td>
            <td class="text-center" style="color:var(--success)">${s.approved}</td>
            <td class="text-center" style="color:var(--warning)">${s.pending}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

/* =====================================================
   사용자 관리 (loadUserManage)
   ===================================================== */
async function loadUserManage() {
  if (!currentUser || currentUser.role !== 'ADMIN') {
    document.getElementById('page-user-manage').innerHTML =
      `<div class="empty-state"><i class="fas fa-lock"></i><p>관리자 전용 메뉴입니다</p></div>`;
    return;
  }

  const container = document.getElementById('page-user-manage');
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  try {
    const users = await getAllUsers();
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-users-cog"></i> 사용자 관리</span>
          <button class="btn btn-primary btn-sm" onclick="openUserModal()">
            <i class="fas fa-user-plus"></i> 사용자 추가
          </button>
        </div>
        <div class="card-body">
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>사원번호</th><th>이름</th><th>부서</th><th>직급</th>
                  <th>역할</th><th class="text-center">상태</th><th class="text-center">작업</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr>
                    <td><code>${u.emp_no || '-'}</code></td>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.dept || '-'}</td>
                    <td>${u.position || '-'}</td>
                    <td><span class="badge ${getRoleColor(u.role)}">${getRoleLabel(u.role)}</span></td>
                    <td class="text-center">
                      <span class="badge ${u.active ? 'badge-approved' : 'badge-cancelled'}">
                        ${u.active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td class="text-center">
                      <div style="display:flex;gap:4px;justify-content:center">
                        <button class="btn btn-outline btn-sm" onclick="openUserModal('${u.id}')">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline btn-sm"
                          onclick="toggleUserActive('${u.id}', ${u.active})">
                          <i class="fas fa-${u.active ? 'ban' : 'check'}"></i>
                        </button>
                        ${u.id !== currentUser.id ? `
                          <button class="btn btn-danger btn-sm"
                            onclick="handleDeleteUser('${u.id}', '${u.name}')">
                            <i class="fas fa-trash"></i>
                          </button>` : ''}
                      </div>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 사용자 편집 모달 -->
      <div class="modal-overlay" id="user-modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <span class="modal-title" id="user-modal-title"><i class="fas fa-user"></i> 사용자 추가</span>
            <button class="modal-close" onclick="closeModal('user-modal-overlay')">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body" id="user-modal-body"></div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeModal('user-modal-overlay')">취소</button>
            <button class="btn btn-primary" onclick="saveUser()">저장</button>
          </div>
        </div>
      </div>`;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>로드 실패</p></div>`;
  }
}

let editingUserId = null;

async function openUserModal(userId = null) {
  editingUserId = userId;
  let user = { emp_no:'', name:'', dept:'', position:'사원', role:'EMPLOYEE', active:true, password:'' };

  if (userId) {
    try { user = await getUserById(userId); } catch {}
    document.getElementById('user-modal-title').innerHTML = '<i class="fas fa-user-edit"></i> 사용자 수정';
  } else {
    document.getElementById('user-modal-title').innerHTML = '<i class="fas fa-user-plus"></i> 사용자 추가';
  }

  document.getElementById('user-modal-body').innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label class="form-label required">사원번호</label>
        <input type="text" id="u-emp_no" class="form-control" value="${user.emp_no||''}" placeholder="EMP001">
      </div>
      <div class="form-group">
        <label class="form-label required">이름</label>
        <input type="text" id="u-name" class="form-control" value="${user.name||''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label required">부서</label>
        <input type="text" id="u-dept" class="form-control" value="${user.dept||''}" placeholder="전기공사">
      </div>
      <div class="form-group">
        <label class="form-label required">직급</label>
        <select id="u-position" class="form-control">
          ${Object.keys(RANK_MAP).sort((a,b) => RANK_MAP[b]-RANK_MAP[a]).map(p =>
            `<option value="${p}" ${user.position===p?'selected':''}>${p}</option>`
          ).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label required">역할</label>
        <select id="u-role" class="form-control">
          <option value="EMPLOYEE" ${user.role==='EMPLOYEE'?'selected':''}>직원</option>
          <option value="MANAGER"  ${user.role==='MANAGER'?'selected':''}>매니저</option>
          <option value="ADMIN"    ${user.role==='ADMIN'?'selected':''}>관리자</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">이메일</label>
        <input type="email" id="u-email" class="form-control" value="${user.email||''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label ${userId ? '' : 'required'}">비밀번호 ${userId ? '(변경 시만 입력)' : ''}</label>
        <input type="password" id="u-password" class="form-control" placeholder="${userId ? '변경하지 않으려면 비워두세요' : '비밀번호 입력'}">
      </div>
      <div class="form-group">
        <label class="form-label">상태</label>
        <select id="u-active" class="form-control">
          <option value="true"  ${user.active?'selected':''}>활성</option>
          <option value="false" ${!user.active?'selected':''}>비활성</option>
        </select>
      </div>
    </div>`;

  openModal('user-modal-overlay');
}

async function saveUser() {
  const emp_no   = document.getElementById('u-emp_no')?.value?.trim();
  const name     = document.getElementById('u-name')?.value?.trim();
  const dept     = document.getElementById('u-dept')?.value?.trim();
  const position = document.getElementById('u-position')?.value;
  const role     = document.getElementById('u-role')?.value;
  const email    = document.getElementById('u-email')?.value?.trim();
  const password = document.getElementById('u-password')?.value;
  const active   = document.getElementById('u-active')?.value === 'true';

  if (!emp_no || !name || !dept || !position) {
    showToast('필수 항목을 모두 입력해주세요.', 'warning');
    return;
  }

  const data = { emp_no, name, dept, position, role, email, active };
  if (password) data.password = password;
  if (!editingUserId && !password) {
    showToast('비밀번호를 입력해주세요.', 'warning');
    return;
  }

  try {
    if (editingUserId) {
      await updateUser(editingUserId, data);
      showToast('사용자 정보가 수정되었습니다.', 'success');
    } else {
      // ── 사원번호 중복 체크 ──
      const allUsers = await getAllUsers();
      const duplicate = allUsers.find(u => u.emp_no === emp_no);
      if (duplicate) {
        showToast(`이미 사용 중인 사원번호입니다. (${emp_no})`, 'error');
        return;
      }
      await createUser(data);
      showToast('사용자가 추가되었습니다.', 'success');
    }
    closeModal('user-modal-overlay');
    await loadUserManage();
  } catch (err) {
    showToast('저장 실패: ' + err.message, 'error');
  }
}

async function toggleUserActive(userId, currentActive) {
  try {
    await updateUser(userId, { active: !currentActive });
    showToast(`사용자를 ${!currentActive ? '활성화' : '비활성화'}했습니다.`, 'success');
    await loadUserManage();
  } catch (err) {
    showToast('변경 실패: ' + err.message, 'error');
  }
}

async function handleDeleteUser(userId, name) {
  if (!confirm(`${name} 사용자를 삭제하시겠습니까?`)) return;
  try {
    await deleteUser(userId);
    showToast('사용자가 삭제되었습니다.', 'success');
    await loadUserManage();
  } catch (err) {
    showToast('삭제 실패: ' + err.message, 'error');
  }
}

/* =====================================================
   결재선 템플릿 (loadTemplates)
   ===================================================== */
async function loadTemplates() {
  if (!currentUser) return;
  const isAdmin = currentUser.role === 'ADMIN';
  const container = document.getElementById('page-templates');
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  try {
    const templates = await getApprovalTemplates();
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-project-diagram"></i> 결재선 템플릿</span>
          ${isAdmin ? `<button class="btn btn-primary btn-sm" onclick="openTemplateModal()">
            <i class="fas fa-plus"></i> 템플릿 추가
          </button>` : ''}
        </div>
        <div class="card-body">
          ${templates.length === 0
            ? `<div class="empty-state"><i class="fas fa-stream"></i><p>등록된 템플릿이 없습니다</p></div>`
            : templates.map(t => `
              <div class="template-card">
                <div class="tc-left">
                  <div class="tc-name">${t.name}</div>
                  <div class="tc-sub">
                    <span class="badge badge-primary">${getDocTypeName(t.doc_type)}</span>
                    <span class="badge ${t.active ? 'badge-approved' : 'badge-cancelled'}" style="margin-left:6px">
                      ${t.active ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>
                ${isAdmin ? `
                  <div class="tc-actions">
                    <button class="btn btn-outline btn-sm" onclick="openTemplateModal('${t.id}')">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="handleDeleteTemplate('${t.id}')">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>` : ''}
              </div>`).join('')
          }
        </div>
      </div>

      <!-- 자동 결재선 안내 -->
      <div class="card mt-3" style="margin-top:16px">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-info-circle"></i> 자동 결재선 구성 안내</span>
        </div>
        <div class="card-body">
          <p style="font-size:13px;color:var(--gray-700);line-height:1.8">
            이 시스템은 <strong>자동 결재라인</strong>을 사용합니다.<br>
            기안자의 직급과 같거나 높은 직급의 모든 활성 사용자가 결재라인에 포함됩니다.<br>
            직급 오름차순으로 정렬되며, 대표는 항상 마지막에 배치됩니다.<br>
            <br>
            <strong>직급 위계:</strong> 사원(1) → 주임(2) → 대리(3) → 과장(4) → 차장(5) → 부장(6) → 이사(7) → 대표(8)<br>
            <span style="color:var(--warning);font-size:12px"><i class="fas fa-info-circle"></i> 이지숙(시스템 관리자)은 결재라인에서 제외됩니다. 황시은 기안 시 이지숙→박태성 다이렉트 결재선이 적용됩니다.</span>
          </p>
        </div>
      </div>

      <!-- 템플릿 모달 -->
      <div class="modal-overlay" id="template-modal-overlay">
        <div class="modal modal-lg">
          <div class="modal-header">
            <span class="modal-title" id="template-modal-title"><i class="fas fa-stream"></i> 템플릿</span>
            <button class="modal-close" onclick="closeModal('template-modal-overlay')">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body" id="template-modal-body"></div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeModal('template-modal-overlay')">취소</button>
            <button class="btn btn-primary" onclick="saveTemplate()">저장</button>
          </div>
        </div>
      </div>`;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>로드 실패</p></div>`;
  }
}

let editingTemplateId = null;

async function openTemplateModal(templateId = null) {
  editingTemplateId = templateId;
  let t = { name:'', doc_type:'VAC', steps:'[]', active:true };

  if (templateId) {
    const templates = await getApprovalTemplates();
    t = templates.find(x => x.id === templateId) || t;
  }

  document.getElementById('template-modal-title').innerHTML =
    `<i class="fas fa-stream"></i> 템플릿 ${templateId ? '수정' : '추가'}`;
  document.getElementById('template-modal-body').innerHTML = `
    <div class="form-group">
      <label class="form-label required">템플릿명</label>
      <input type="text" id="tpl-name" class="form-control" value="${t.name}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">문서유형</label>
        <select id="tpl-doctype" class="form-control">
          <option value="VAC" ${t.doc_type==='VAC'?'selected':''}>연차신청서</option>
          <option value="OVT" ${t.doc_type==='OVT'?'selected':''}>연장근무신청서</option>
          <option value="ALL">공통</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">상태</label>
        <select id="tpl-active" class="form-control">
          <option value="true"  ${t.active?'selected':''}>활성</option>
          <option value="false" ${!t.active?'selected':''}>비활성</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">비고</label>
      <textarea id="tpl-steps" class="form-control" rows="4"
        placeholder="결재선 구성 메모 (JSON 또는 설명)">${t.steps||''}</textarea>
    </div>`;

  openModal('template-modal-overlay');
}

async function saveTemplate() {
  const name    = document.getElementById('tpl-name')?.value?.trim();
  const docType = document.getElementById('tpl-doctype')?.value;
  const active  = document.getElementById('tpl-active')?.value === 'true';
  const steps   = document.getElementById('tpl-steps')?.value?.trim() || '[]';

  if (!name) { showToast('템플릿명을 입력해주세요.', 'warning'); return; }

  try {
    const data = { name, doc_type: docType, steps, active };
    if (editingTemplateId) {
      await updateApprovalTemplate(editingTemplateId, data);
      showToast('템플릿이 수정되었습니다.', 'success');
    } else {
      await createApprovalTemplate(data);
      showToast('템플릿이 추가되었습니다.', 'success');
    }
    closeModal('template-modal-overlay');
    await loadTemplates();
  } catch (err) {
    showToast('저장 실패: ' + err.message, 'error');
  }
}

async function handleDeleteTemplate(id) {
  if (!confirm('템플릿을 삭제하시겠습니까?')) return;
  try {
    await deleteApprovalTemplate(id);
    showToast('템플릿이 삭제되었습니다.', 'success');
    await loadTemplates();
  } catch (err) {
    showToast('삭제 실패: ' + err.message, 'error');
  }
}

/* =====================================================
   감사로그 (loadAuditLog)
   ===================================================== */
async function loadAuditLog() {
  if (!currentUser) return;
  if (currentUser.role !== 'ADMIN') {
    document.getElementById('page-audit-log').innerHTML =
      `<div class="empty-state"><i class="fas fa-lock"></i><p>관리자 전용 메뉴입니다</p></div>`;
    return;
  }

  const container = document.getElementById('page-audit-log');
  container.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

  try {
    const logs = await getAuditLogs(200);
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="fas fa-history"></i> 감사 로그</span>
          <span class="text-muted text-small">최근 200건</span>
        </div>
        <div class="card-body" style="padding:0">
          ${logs.length === 0
            ? `<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>감사 로그가 없습니다</p></div>`
            : logs.map(log => `
              <div class="audit-log-item">
                <div class="audit-icon ${getAuditIconStyle(log.event_type)}">
                  <i class="fas ${getAuditIcon(log.event_type)}"></i>
                </div>
                <div class="audit-info" style="flex:1">
                  <div class="audit-detail">${log.detail || log.event_type}</div>
                  <div class="audit-meta">
                    ${log.actor_name || log.actor_id || '시스템'} ·
                    ${formatDateTime(log.created_at)}
                    ${log.doc_id ? `· <a href="#" onclick="openDocDetail('${log.doc_id}');return false;" style="color:var(--primary)">문서 보기</a>` : ''}
                  </div>
                </div>
                <span class="badge ${getAuditBadgeClass(log.event_type)}" style="flex-shrink:0">
                  ${log.event_type}
                </span>
              </div>`).join('')
          }
        </div>
      </div>`;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>로드 실패</p></div>`;
  }
}

function getAuditIcon(type) {
  const map = {
    LOGIN: 'fa-sign-in-alt', LOGOUT: 'fa-sign-out-alt',
    SUBMIT: 'fa-paper-plane', APPROVE: 'fa-check',
    REJECT: 'fa-times', CANCEL: 'fa-ban',
    DELETE: 'fa-trash', CREATE: 'fa-plus'
  };
  return map[type] || 'fa-info';
}

function getAuditIconStyle(type) {
  const map = {
    LOGIN: 'style="background:var(--primary-light);color:var(--primary)"',
    LOGOUT: 'style="background:var(--gray-100);color:var(--gray-500)"',
    SUBMIT: 'style="background:var(--info-light);color:var(--info)"',
    APPROVE: 'style="background:var(--success-light);color:var(--success)"',
    REJECT: 'style="background:var(--danger-light);color:var(--danger)"',
    CANCEL: 'style="background:var(--warning-light);color:var(--warning)"',
    DELETE: 'style="background:var(--danger-light);color:var(--danger)"'
  };
  return map[type] || '';
}

function getAuditBadgeClass(type) {
  const map = {
    LOGIN: 'badge-primary', LOGOUT: 'badge-draft',
    SUBMIT: 'badge-pending', APPROVE: 'badge-approved',
    REJECT: 'badge-rejected', CANCEL: 'badge-cancelled',
    DELETE: 'badge-rejected'
  };
  return map[type] || 'badge-draft';
}
