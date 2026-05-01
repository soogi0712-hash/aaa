/* =====================================================
   js/form-vac.js — 연차신청서 (잔여연차 표시 + 초과방지)
   ===================================================== */

'use strict';

let vacEditDocId    = null;
let vacLeaveBalance = null;   // 현재 사용자 연차 잔여 정보

async function loadFormVac(editDocId = null) {
  if (!currentUser) return;
  vacEditDocId = editDocId;

  const container = document.getElementById('page-form-vac');

  // 기존 draft 불러오기
  let draftBody = {};
  if (editDocId) {
    try {
      const doc = await getDocumentById(editDocId);
      draftBody = JSON.parse(doc.body || '{}');
    } catch {}
  }

  const today = todayStr();
  const year  = todayYear();

  // ── 연차 잔여 조회 (없으면 자동 생성) ──
  // currentUser에 emp_no / join_date 누락 가능 → DB 재조회로 보완
  vacLeaveBalance = null;
  try {
    // ① 세션에 join_date 없으면 DB에서 최신 사용자 정보 재조회
    if (!currentUser.join_date || !currentUser.emp_no) {
      try {
        const freshUser = await getUserById(currentUser.id);
        if (freshUser) {
          currentUser = freshUser;
          sessionStorage.setItem('yes_user', JSON.stringify(freshUser));
        }
      } catch {}
    }

    vacLeaveBalance = await getLeaveBalance(currentUser.id, year);

    // ② DB에 레코드가 없을 때만 신규 생성 (기존 레코드는 절대 덮어쓰지 않음)
    if (!vacLeaveBalance) {
      const joinDate = currentUser.join_date;
      const total = joinDate ? calcLeaveEntitlement(joinDate, year) : 15;
      await API.post('leave_balances', {
        user_id: currentUser.id, user_name: currentUser.name, year,
        total_days: total, used_days: 0, remain_days: total
      });
      vacLeaveBalance = await getLeaveBalance(currentUser.id, year);
    }
    // ※ 기존 레코드가 있으면 절대 수정하지 않음 (관리자 직접 입력값 보존)
  } catch {}

  const totalDays  = vacLeaveBalance?.total_days  ?? '—';
  const usedDays   = vacLeaveBalance?.used_days   ?? '—';
  const remainDays = vacLeaveBalance?.remain_days ?? '—';

  // 잔여 0 이하면 색상 빨간색
  const remainColor = (remainDays !== '—' && remainDays <= 0)
    ? 'var(--danger)' : 'var(--success)';

  container.innerHTML = `
    <div class="form-page-layout">
      <!-- 문서 양식 -->
      <div class="doc-paper">
        <div class="doc-paper-header">
          <h2><i class="fas fa-umbrella-beach"></i> 연차신청서</h2>
          <p>Annual Leave Request Form</p>
        </div>
        <div class="doc-paper-body">

          <!-- ★ 연차 현황 배너 — 최상단 -->
          <div class="vac-balance-banner">
            <div class="vbb-item">
              <div class="vbb-num">${totalDays}</div>
              <div class="vbb-label">발생 연차</div>
            </div>
            <div class="vbb-divider"></div>
            <div class="vbb-item">
              <div class="vbb-num" style="color:var(--warning)">${usedDays}</div>
              <div class="vbb-label">사용 연차</div>
            </div>
            <div class="vbb-divider"></div>
            <div class="vbb-item">
              <div class="vbb-num" style="color:${remainColor}">${remainDays}</div>
              <div class="vbb-label">잔여 연차</div>
            </div>
            <div class="vbb-year">${year}년 기준</div>
          </div>

          <!-- 기안 정보 -->
          <div class="doc-meta-grid">
            <div class="doc-meta-item">
              <label>기안자</label>
              <span>${currentUser.name}</span>
            </div>
            <div class="doc-meta-item">
              <label>부서</label>
              <span>${currentUser.dept}</span>
            </div>
            <div class="doc-meta-item">
              <label>직급</label>
              <span>${currentUser.position}</span>
            </div>
            <div class="doc-meta-item">
              <label>기안일</label>
              <span>${formatDate(today)}</span>
            </div>
            <div class="doc-meta-item">
              <label>문서번호</label>
              <span class="text-muted" style="font-size:11px">
                ${editDocId ? '저장 시 발급' : '상신 시 자동발급'}
              </span>
            </div>
          </div>

          <!-- 제목 -->
          <div class="doc-section">
            <div class="doc-section-title"><i class="fas fa-heading"></i> 제목</div>
            <div class="form-group">
              <input type="text" id="vac-title" class="form-control"
                placeholder="예) ${year}년 연차신청" value="${draftBody.title || ''}">
            </div>
          </div>

          <!-- 휴가 유형 -->
          <div class="doc-section">
            <div class="doc-section-title"><i class="fas fa-tag"></i> 휴가 유형</div>
            <div class="vac-type-buttons">
              ${[
                { v:'FULL',    t:'연차(종일)' },
                { v:'HALF_AM', t:'오전반차' },
                { v:'HALF_PM', t:'오후반차' },
                { v:'SICK',    t:'병가' },
                { v:'SPECIAL', t:'특별휴가' }
              ].map(btn => `
                <button type="button"
                  class="vac-type-btn${(draftBody.vac_type||'FULL')===btn.v?' active':''}"
                  onclick="selectVacType('${btn.v}')">${btn.t}</button>`).join('')}
            </div>
            <input type="hidden" id="vac-type" value="${draftBody.vac_type || 'FULL'}">
          </div>

          <!-- 휴가 기간 -->
          <div class="doc-section">
            <div class="doc-section-title"><i class="fas fa-calendar-alt"></i> 휴가 기간</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">시작일</label>
                <input type="date" id="vac-start" class="form-control"
                  value="${draftBody.start_date || today}" onchange="calcVacTotal()">
              </div>
              <div class="form-group">
                <label class="form-label required">종료일</label>
                <input type="date" id="vac-end" class="form-control"
                  value="${draftBody.end_date || today}" onchange="calcVacTotal()">
              </div>
            </div>
            <!-- 계산 결과 + 잔여 비교 -->
            <div class="vac-calc-result" id="vac-calc-result">
              <i class="fas fa-calculator"></i>
              <span id="vac-days-text">계산 중...</span>
            </div>
            <div id="vac-over-warn" class="vac-over-warn" style="display:none">
              <i class="fas fa-exclamation-triangle"></i>
              신청일수가 잔여 연차를 초과합니다!
            </div>
          </div>

          <!-- 사유 -->
          <div class="doc-section">
            <div class="doc-section-title"><i class="fas fa-comment-alt"></i> 휴가 사유</div>
            <div class="form-group">
              <textarea id="vac-reason" class="form-control" rows="3"
                placeholder="휴가 사유를 입력하세요">${draftBody.reason || ''}</textarea>
            </div>
          </div>

          <!-- 추가 정보 -->
          <div class="doc-section">
            <div class="doc-section-title"><i class="fas fa-info-circle"></i> 추가 정보</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">비상연락처</label>
                <input type="text" id="vac-contact" class="form-control"
                  placeholder="010-0000-0000" value="${draftBody.contact || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">업무대행자</label>
                <input type="text" id="vac-backup" class="form-control"
                  placeholder="업무대행자 이름" value="${draftBody.backup_person || ''}">
              </div>
            </div>
          </div>

          <!-- 버튼 -->
          <div class="form-actions">
            <button class="btn btn-outline" onclick="resetVacForm()">
              <i class="fas fa-redo"></i> 초기화
            </button>
            <button class="btn btn-outline" onclick="saveVacDraft()">
              <i class="fas fa-save"></i> 임시저장
            </button>
            <button class="btn btn-primary btn-lg" id="vac-submit-btn" onclick="submitVacForm()">
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
        <div class="panel-body" id="vac-approval-line">
          <div class="spinner-wrap"><div class="spinner"></div></div>
        </div>
      </div>
    </div>`;

  loadVacApprovalLine();
  calcVacTotal();
}

/* ── 휴가 유형 선택 ── */
function selectVacType(type) {
  document.getElementById('vac-type').value = type;
  document.querySelectorAll('.vac-type-btn').forEach(btn => {
    const oc = btn.getAttribute('onclick') || '';
    btn.classList.toggle('active', oc.includes(`'${type}'`));
  });
  calcVacTotal();
}

/* ── 일수 계산 + 잔여 비교 ── */
function calcVacTotal() {
  const start  = document.getElementById('vac-start')?.value;
  const end    = document.getElementById('vac-end')?.value;
  const type   = document.getElementById('vac-type')?.value || 'FULL';
  const days   = calcVacDays(start, end, type);
  const textEl = document.getElementById('vac-days-text');
  const warnEl = document.getElementById('vac-over-warn');
  const btnEl  = document.getElementById('vac-submit-btn');

  if (textEl) {
    if (type === 'HALF_AM' || type === 'HALF_PM') {
      textEl.textContent = `${getVacTypeName(type)} — 0.5일 사용`;
    } else {
      textEl.textContent = `${start} ~ ${end} · 총 ${days}일 (평일 기준)`;
    }
  }

  // 잔여 초과 경고 (병가/특별휴가는 연차 차감 안 하므로 체크 제외)
  const isLeaveType = (type === 'FULL' || type === 'HALF_AM' || type === 'HALF_PM');
  const remain = vacLeaveBalance?.remain_days ?? null;
  const isOver = isLeaveType && remain !== null && days > remain;

  if (warnEl) warnEl.style.display = isOver ? 'flex' : 'none';

  // 잔여 초과 시 상신 버튼 비활성화
  if (btnEl) {
    btnEl.disabled = isOver;
    btnEl.style.opacity = isOver ? '0.5' : '1';
  }
}

/* ── 결재선 로드 ── */
async function loadVacApprovalLine() {
  const el = document.getElementById('vac-approval-line');
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

/* ── 폼 데이터 수집 ── */
function getVacFormData() {
  const title   = document.getElementById('vac-title')?.value?.trim();
  const type    = document.getElementById('vac-type')?.value || 'FULL';
  const start   = document.getElementById('vac-start')?.value;
  const end     = document.getElementById('vac-end')?.value;
  const reason  = document.getElementById('vac-reason')?.value?.trim();
  const contact = document.getElementById('vac-contact')?.value?.trim();
  const backup  = document.getElementById('vac-backup')?.value?.trim();
  const days    = calcVacDays(start, end, type);

  return {
    formTitle: title || `${currentUser.name} 연차신청서`,
    body: { title: title || '', vac_type: type,
            start_date: start, end_date: end,
            days, reason, contact, backup_person: backup }
  };
}

/* ── 유효성 검사 ── */
function validateVacForm() {
  const start  = document.getElementById('vac-start')?.value;
  const end    = document.getElementById('vac-end')?.value;
  const type   = document.getElementById('vac-type')?.value || 'FULL';
  const days   = calcVacDays(start, end, type);
  const remain = vacLeaveBalance?.remain_days ?? null;

  if (!start || !end) {
    showToast('휴가 기간을 입력해주세요.', 'warning'); return false;
  }
  if (new Date(end) < new Date(start)) {
    showToast('종료일이 시작일보다 이전일 수 없습니다.', 'warning'); return false;
  }

  // 연차/반차는 잔여일수 초과 금지
  const isLeaveType = (type === 'FULL' || type === 'HALF_AM' || type === 'HALF_PM');
  if (isLeaveType && remain !== null && days > remain) {
    showToast(`잔여 연차(${remain}일)가 부족합니다. 신청일수: ${days}일`, 'error');
    return false;
  }
  return true;
}

/* ── 상신 ── */
async function submitVacForm() {
  if (!validateVacForm()) return;
  const { formTitle, body } = getVacFormData();

  const btn = document.getElementById('vac-submit-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...'; }

  try {
    const doc = await submitDocument('VAC', formTitle, body, vacEditDocId);
    showToast(`연차신청서가 상신되었습니다! (${doc.doc_no})`, 'success');
    vacEditDocId = null;
    await navigateTo('my-docs');
  } catch (err) {
    showToast('상신 실패: ' + err.message, 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> 상신'; }
  }
}

/* ── 임시저장 ── */
async function saveVacDraft() {
  const { formTitle, body } = getVacFormData();
  try {
    const doc = await saveDraftDocument('VAC', formTitle, body, vacEditDocId);
    vacEditDocId = doc.id;
    showToast('임시저장 완료!', 'success');
  } catch (err) {
    showToast('임시저장 실패: ' + err.message, 'error');
  }
}

/* ── 초기화 ── */
function resetVacForm() {
  if (!confirm('작성 내용을 초기화하시겠습니까?')) return;
  vacEditDocId = null;
  loadFormVac();
}
