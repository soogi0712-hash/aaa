/* =====================================================
   js/form-ovt.js — 연장근무신청서
   ===================================================== */

'use strict';

let ovtEditDocId = null;
let ovtWorkerRows = [];

async function loadFormOvt(editDocId = null) {
  if (!currentUser) return;
  ovtEditDocId = editDocId;

  let draftBody = {};
  if (editDocId) {
    try {
      const doc = await getDocumentById(editDocId);
      draftBody = JSON.parse(doc.body || '{}');
    } catch {}
  }

  const today = todayStr();

  // 초기 근무자 행
  ovtWorkerRows = (draftBody.workers && draftBody.workers.length)
    ? draftBody.workers
    : [{ name: currentUser.name, dept: currentUser.dept, position: currentUser.position, start_time: '18:00', end_time: '21:00', hours: 3 }];

  const container = document.getElementById('page-form-ovt');
  container.innerHTML = `
    <div class="form-page-layout">
      <!-- 문서 양식 -->
      <div class="doc-paper">
        <div class="doc-paper-header">
          <h2><i class="fas fa-business-time"></i> 연장근무신청서</h2>
          <p>Overtime Work Request Form</p>
        </div>
        <div class="doc-paper-body">

          <!-- 기안 정보 -->
          <div class="doc-meta-grid">
            <div class="doc-meta-item"><label>기안자</label><span>${currentUser.name}</span></div>
            <div class="doc-meta-item"><label>부서</label><span>${currentUser.dept}</span></div>
            <div class="doc-meta-item"><label>직급</label><span>${currentUser.position}</span></div>
            <div class="doc-meta-item"><label>기안일</label><span>${formatDate(today)}</span></div>
            <div class="doc-meta-item">
              <label>문서번호</label>
              <span class="text-muted" style="font-size:11px">상신 시 자동발급</span>
            </div>
          </div>

          <!-- 제목 -->
          <div class="doc-section">
            <div class="doc-section-title"><i class="fas fa-heading"></i> 제목</div>
            <div class="form-group">
              <input type="text" id="ovt-title" class="form-control"
                placeholder="예) 2026년 1월 연장근무신청"
                value="${draftBody.title || ''}">
            </div>
          </div>

          <!-- 근무 정보 -->
          <div class="doc-section">
            <div class="doc-section-title"><i class="fas fa-calendar-day"></i> 근무 정보</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">연장근무일</label>
                <input type="date" id="ovt-date" class="form-control"
                  value="${draftBody.work_date || today}">
              </div>
              <div class="form-group">
                <label class="form-label required">시작 시간</label>
                <input type="time" id="ovt-start-time" class="form-control"
                  value="${draftBody.start_time || '18:00'}" onchange="ovtUpdateHours()">
              </div>
              <div class="form-group">
                <label class="form-label required">종료 시간</label>
                <input type="time" id="ovt-end-time" class="form-control"
                  value="${draftBody.end_time || '21:00'}" onchange="ovtUpdateHours()">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">근무 장소</label>
                <input type="text" id="ovt-location" class="form-control"
                  placeholder="예) 본사 3층 사무실"
                  value="${draftBody.location || ''}">
              </div>
              <div class="form-group">
                <label class="form-label required">연장근무 사유</label>
                <input type="text" id="ovt-reason" class="form-control"
                  placeholder="연장근무 사유를 입력하세요"
                  value="${draftBody.reason || ''}">
              </div>
            </div>
          </div>

          <!-- 근무자 목록 -->
          <div class="doc-section">
            <div class="doc-section-title">
              <i class="fas fa-users"></i> 근무자 목록
              <span class="text-muted text-small" style="font-weight:400;margin-left:6px">
                (<span id="ovt-worker-count">${ovtWorkerRows.length}</span>명)
              </span>
            </div>
            <div class="table-wrap">
              <table class="ovt-worker-table" id="ovt-worker-table">
                <thead>
                  <tr>
                    <th style="width:36px">#</th>
                    <th>성명</th>
                    <th>부서</th>
                    <th>직급</th>
                    <th style="width:90px">시작</th>
                    <th style="width:90px">종료</th>
                    <th style="width:70px">시간</th>
                    <th style="width:40px"></th>
                  </tr>
                </thead>
                <tbody id="ovt-worker-tbody">
                </tbody>
              </table>
            </div>
            <button class="btn-add-row" onclick="ovtAddRow()">
              <i class="fas fa-plus"></i> 근무자 추가
            </button>
          </div>

          <!-- 특이사항 -->
          <div class="doc-section">
            <div class="doc-section-title"><i class="fas fa-sticky-note"></i> 특이사항</div>
            <div class="form-group">
              <textarea id="ovt-note" class="form-control" rows="3"
                placeholder="특이사항을 입력하세요 (선택)">${draftBody.note || ''}</textarea>
            </div>
          </div>

          <!-- 버튼 -->
          <div class="form-actions">
            <button class="btn btn-outline" onclick="resetOvtForm()">
              <i class="fas fa-redo"></i> 초기화
            </button>
            <button class="btn btn-outline" onclick="saveOvtDraft()">
              <i class="fas fa-save"></i> 임시저장
            </button>
            <button class="btn btn-primary btn-lg" onclick="submitOvtForm()">
              <i class="fas fa-paper-plane"></i> 상신
            </button>
          </div>
        </div>
      </div>

      <!-- 결재선 패널 -->
      <div class="approval-line-panel">
        <div class="panel-header">
          <i class="fas fa-user-check"></i> 결재선 (자동구성)
        </div>
        <div class="panel-body" id="ovt-approval-line">
          <div class="spinner-wrap"><div class="spinner"></div></div>
        </div>
      </div>
    </div>`;

  // 근무자 테이블 렌더링
  renderOvtWorkers();
  // 결재라인 로드
  loadOvtApprovalLine();
}

/* ── 근무자 행 렌더링 ── */
function renderOvtWorkers() {
  const tbody = document.getElementById('ovt-worker-tbody');
  if (!tbody) return;
  tbody.innerHTML = ovtWorkerRows.map((w, i) => `
    <tr id="ovt-row-${i}">
      <td class="text-center" style="color:var(--gray-500)">${i + 1}</td>
      <td><input type="text" value="${w.name || ''}" placeholder="성명"
        onchange="ovtUpdateRow(${i}, 'name', this.value)"></td>
      <td><input type="text" value="${w.dept || ''}" placeholder="부서"
        onchange="ovtUpdateRow(${i}, 'dept', this.value)"></td>
      <td>
        <select onchange="ovtUpdateRow(${i}, 'position', this.value)">
          ${['대표','이사','부장','차장','과장','대리','주임','사원'].map(p =>
            `<option value="${p}" ${w.position === p ? 'selected' : ''}>${p}</option>`
          ).join('')}
        </select>
      </td>
      <td><input type="time" value="${w.start_time || '18:00'}"
        onchange="ovtUpdateRow(${i}, 'start_time', this.value); ovtCalcRowHours(${i})"></td>
      <td><input type="time" value="${w.end_time || '21:00'}"
        onchange="ovtUpdateRow(${i}, 'end_time', this.value); ovtCalcRowHours(${i})"></td>
      <td class="text-center">
        <input type="number" value="${w.hours || 3}" min="0" max="24" style="width:52px;text-align:center"
          onchange="ovtUpdateRow(${i}, 'hours', parseFloat(this.value) || 0)" id="ovt-hours-${i}">
      </td>
      <td class="text-center">
        ${ovtWorkerRows.length > 1 ? `
          <button onclick="ovtRemoveRow(${i})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:14px">
            <i class="fas fa-times"></i>
          </button>` : ''}
      </td>
    </tr>`).join('');

  const countEl = document.getElementById('ovt-worker-count');
  if (countEl) countEl.textContent = ovtWorkerRows.length;
}

function ovtAddRow() {
  const startTime = document.getElementById('ovt-start-time')?.value || '18:00';
  const endTime   = document.getElementById('ovt-end-time')?.value   || '21:00';
  ovtWorkerRows.push({ name: '', dept: '', position: '사원', start_time: startTime, end_time: endTime, hours: 3 });
  renderOvtWorkers();
}

function ovtRemoveRow(idx) {
  if (ovtWorkerRows.length <= 1) return;
  ovtWorkerRows.splice(idx, 1);
  renderOvtWorkers();
}

function ovtUpdateRow(idx, field, value) {
  if (ovtWorkerRows[idx]) ovtWorkerRows[idx][field] = value;
}

function ovtCalcRowHours(idx) {
  const row   = ovtWorkerRows[idx];
  if (!row) return;
  const start = row.start_time || '00:00';
  const end   = row.end_time   || '00:00';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  const hours = Math.round(diff / 60 * 10) / 10;
  row.hours = hours;
  const el = document.getElementById(`ovt-hours-${idx}`);
  if (el) el.value = hours;
}

function ovtUpdateHours() {
  const start = document.getElementById('ovt-start-time')?.value;
  const end   = document.getElementById('ovt-end-time')?.value;
  if (!start || !end) return;
  // 모든 행의 시간 동기화 옵션 (첫 행만)
  if (ovtWorkerRows[0]) {
    ovtWorkerRows[0].start_time = start;
    ovtWorkerRows[0].end_time   = end;
    ovtCalcRowHours(0);
    renderOvtWorkers();
  }
}

async function loadOvtApprovalLine() {
  const el = document.getElementById('ovt-approval-line');
  if (!el) return;
  try {
    const line = await buildAutoApprovalLine(currentUser);
    if (line.length === 0) {
      el.innerHTML = `<p class="text-muted text-small">결재자가 없습니다</p>`;
      return;
    }
    el.innerHTML = line.map(s => `
      <div class="approval-step-item">
        <div class="step-num">${s.step}</div>
        <div class="step-info">
          <div class="step-name">${s.approver_name}</div>
          <div class="step-dept">${s.approver_position} · ${s.approver_dept}</div>
        </div>
        <div class="step-status-icon" style="color:var(--gray-300)">
          <i class="fas fa-clock"></i>
        </div>
      </div>`).join('');
  } catch {
    el.innerHTML = `<p class="text-muted text-small">결재선 로드 실패</p>`;
  }
}

function getOvtFormData() {
  const title     = document.getElementById('ovt-title')?.value?.trim();
  const workDate  = document.getElementById('ovt-date')?.value;
  const startTime = document.getElementById('ovt-start-time')?.value;
  const endTime   = document.getElementById('ovt-end-time')?.value;
  const location  = document.getElementById('ovt-location')?.value?.trim();
  const reason    = document.getElementById('ovt-reason')?.value?.trim();
  const note      = document.getElementById('ovt-note')?.value?.trim();

  const body = {
    title:      title || '',
    work_date:  workDate,
    start_time: startTime,
    end_time:   endTime,
    location,
    reason,
    note,
    workers:    ovtWorkerRows
  };

  return {
    formTitle: title || `${currentUser.name} 연장근무신청서`,
    body
  };
}

function validateOvtForm() {
  const date   = document.getElementById('ovt-date')?.value;
  const reason = document.getElementById('ovt-reason')?.value?.trim();
  if (!date) { showToast('연장근무일을 선택해주세요.', 'warning'); return false; }
  if (!reason) { showToast('연장근무 사유를 입력해주세요.', 'warning'); return false; }
  const hasEmpty = ovtWorkerRows.some(w => !w.name.trim());
  if (hasEmpty) { showToast('근무자 성명을 모두 입력해주세요.', 'warning'); return false; }
  return true;
}

async function submitOvtForm() {
  if (!validateOvtForm()) return;
  const { formTitle, body } = getOvtFormData();

  const btn = document.querySelector('#page-form-ovt .btn-primary');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...'; }

  try {
    const doc = await submitDocument('OVT', formTitle, body, ovtEditDocId);
    showToast(`연장근무신청서가 상신되었습니다! (${doc.doc_no})`, 'success');
    ovtEditDocId = null;
    await navigateTo('my-docs');
  } catch (err) {
    showToast('상신 실패: ' + err.message, 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> 상신'; }
  }
}

async function saveOvtDraft() {
  const { formTitle, body } = getOvtFormData();
  try {
    const doc = await saveDraftDocument('OVT', formTitle, body, ovtEditDocId);
    ovtEditDocId = doc.id;
    showToast('임시저장 완료!', 'success');
  } catch (err) {
    showToast('임시저장 실패: ' + err.message, 'error');
  }
}

function resetOvtForm() {
  if (!confirm('작성 내용을 초기화하시겠습니까?')) return;
  ovtEditDocId = null;
  ovtWorkerRows = [];
  loadFormOvt();
}
