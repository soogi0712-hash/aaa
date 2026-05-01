/* =====================================================
   js/api.js — Table API 래퍼 + 자동결재라인 + 연번
   ===================================================== */

'use strict';

/* ── 직급 위계 (높을수록 숫자 큼) ── */
const RANK_MAP = {
  '대표': 8, '이사': 7, '부장': 6, '차장': 5,
  '과장': 4, '대리': 3, '주임': 2, '사원': 1
};

/* ── 황시은 전용 다이렉트 결재선 설정 (emp_no 기준) ── */
const CFG_HWANG_EMPNO    = 'EMP003';  // 다이렉트 결재 적용 대상자
const CFG_JISOOK_EMPNO   = 'admin';   // 1차 결재자 (이지숙)
const CFG_TAESANG_EMPNO  = 'EMP008';  // 최종 결재자 (박태성)

/* ── 기본 API 호출 ── */
const API = {
  async get(table, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`tables/${table}${qs ? '?' + qs : ''}`);
    if (!res.ok) throw new Error(`GET ${table} failed: ${res.status}`);
    return res.json();
  },
  async getOne(table, id) {
    const res = await fetch(`tables/${table}/${id}`);
    if (!res.ok) throw new Error(`GET ${table}/${id} failed: ${res.status}`);
    return res.json();
  },
  async post(table, data) {
    const res = await fetch(`tables/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`POST ${table} failed: ${res.status}`);
    return res.json();
  },
  async put(table, id, data) {
    const res = await fetch(`tables/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`PUT ${table}/${id} failed: ${res.status}`);
    return res.json();
  },
  async patch(table, id, data) {
    const res = await fetch(`tables/${table}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`PATCH ${table}/${id} failed: ${res.status}`);
    return res.json();
  },
  async delete(table, id) {
    const res = await fetch(`tables/${table}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`DELETE ${table}/${id} failed: ${res.status}`);
    return true;
  }
};

/* ── 전체 페이지 수집 (limit 초과 데이터) ── */
async function fetchAll(table, params = {}) {
  const limit = 200;
  let page = 1;
  let allData = [];
  while (true) {
    const res = await API.get(table, { ...params, page, limit });
    const rows = res.data || [];
    allData = allData.concat(rows);
    if (allData.length >= (res.total || 0) || rows.length < limit) break;
    page++;
  }
  return allData;
}

/* =====================================================
   사용자 관련
   ===================================================== */
async function getAllUsers() {
  return fetchAll('users');
}

async function getUserById(id) {
  return API.getOne('users', id);
}

async function loginUser(empNoOrEmail, password) {
  const users = await fetchAll('users');
  return users.find(u =>
    (u.emp_no === empNoOrEmail || u.email === empNoOrEmail) &&
    u.password === password
  ) || null;
}

async function createUser(data) {
  return API.post('users', data);
}

async function updateUser(id, data) {
  return API.patch('users', id, data);
}

async function deleteUser(id) {
  return API.delete('users', id);
}

/* =====================================================
   자동 결재라인 생성 (buildAutoApprovalLine)
   ===================================================== */
async function buildAutoApprovalLine(drafter) {
  // ① 전체 사용자 로드
  const users = await getAllUsers();

  // ② 기안자 emp_no 확보 — DB에서 id로 재조회, 없으면 세션값 사용
  const drafterDB  = users.find(u => u.id === drafter.id) || drafter;
  const drafterEmp = (drafterDB.emp_no || drafter.emp_no || '').trim();

  // ③ 황시은 여부 판단 — emp_no 직접 비교 (가장 확실)
  const isHwang = (drafterEmp === CFG_HWANG_EMPNO);

  /* ──────────────────────────────────────────────────
     황시은(EMP003) 기안 → 이지숙(admin) → 박태성(EMP008)
     다이렉트 2단계 결재선
  ────────────────────────────────────────────────── */
  if (isHwang) {
    const jisook  = users.find(u => u.emp_no === CFG_JISOOK_EMPNO);
    const taesang = users.find(u => u.emp_no === CFG_TAESANG_EMPNO);
    const line = [];
    if (jisook)  line.push(jisook);
    if (taesang) line.push(taesang);
    return line.map((u, i) => ({
      step:              i + 1,
      approver_id:       u.id,
      approver_name:     u.name,
      approver_dept:     u.dept,
      approver_position: u.position,
      label:             getLabelByPosition(u.position),
      status:            'WAITING',
      is_ref:            false,
      acted_at:          '',
      comment:           ''
    }));
  }

  /* ──────────────────────────────────────────────────
     일반 결재라인
     - 기안자 본인 제외
     - 이지숙(emp_no='admin') 항상 제외
     - 기안자 직급 이상 모든 활성 사용자 포함(동일 직급 포함)
     - 직급 오름차순, 대표 항상 마지막
  ────────────────────────────────────────────────── */
  const drafterRank = RANK_MAP[drafterDB.position] || 0;
  const candidates = users.filter(u => {
    if (!u.active) return false;
    if (u.id === drafterDB.id) return false;
    if ((u.emp_no || '').trim() === CFG_JISOOK_EMPNO) return false; // 이지숙 항상 제외
    const rank = RANK_MAP[u.position] || 0;
    return rank >= drafterRank;
  });

  // 직급 오름차순, 같은 직급은 이름순
  candidates.sort((a, b) => {
    const ra = RANK_MAP[a.position] || 0;
    const rb = RANK_MAP[b.position] || 0;
    if (ra !== rb) return ra - rb;
    return (a.name || '').localeCompare(b.name || '');
  });

  // 대표는 항상 마지막
  const repIdx = candidates.findIndex(u => u.position === '대표');
  if (repIdx > -1 && repIdx < candidates.length - 1) {
    const [rep] = candidates.splice(repIdx, 1);
    candidates.push(rep);
  }

  return candidates.map((u, i) => ({
    step:              i + 1,
    approver_id:       u.id,
    approver_name:     u.name,
    approver_dept:     u.dept,
    approver_position: u.position,
    label:             getLabelByPosition(u.position),
    status:            'WAITING',
    is_ref:            false,
    acted_at:          '',
    comment:           ''
  }));
}

function getLabelByPosition(position) {
  const rank = RANK_MAP[position] || 0;
  if (rank >= 8) return '최종결재';      // 대표
  if (rank >= 7) return '임원결재';      // 이사
  if (rank >= 6) return '부서장결재';    // 부장
  if (rank >= 5) return '중간결재';      // 차장
  if (rank >= 4) return '중간결재';      // 과장
  if (rank >= 3) return '검토';          // 대리
  if (rank >= 2) return '검토';          // 주임
  return '검토';                         // 사원
}

/* =====================================================
   문서번호 발급 (issueDocNo)
   ===================================================== */
async function issueDocNo(docType, year) {
  const seqs = await fetchAll('doc_seq');
  const found = seqs.find(s => s.doc_type === docType && s.year === year);

  let newSeq = 1;
  if (found) {
    newSeq = (found.last_seq || 0) + 1;
    await API.patch('doc_seq', found.id, { last_seq: newSeq });
  } else {
    await API.post('doc_seq', { doc_type: docType, year, last_seq: 1 });
    newSeq = 1;
  }

  const prefix = docType === 'VAC' ? 'VAC' : 'OVT';
  const seqStr = String(newSeq).padStart(6, '0');
  return `${prefix}-${year}-${seqStr}`;
}

/* =====================================================
   문서 관련
   ===================================================== */
async function getAllDocuments(params = {}) {
  return fetchAll('documents', params);
}

async function getDocumentById(id) {
  return API.getOne('documents', id);
}

async function createDocument(data) {
  return API.post('documents', data);
}

async function updateDocument(id, data) {
  return API.patch('documents', id, data);
}

async function deleteDocument(id) {
  return API.delete('documents', id);
}

/* ── 내 문서 조회 ── */
async function getMyDocuments(userId) {
  const docs = await fetchAll('documents');
  return docs.filter(d => d.drafter_id === userId);
}

/* ── 결재 대기 문서 (내가 결재해야 할 것) ── */
async function getPendingApprovals(userId) {
  const steps = await fetchAll('approval_steps');
  const myWaiting = steps.filter(s => s.approver_id === userId && s.status === 'WAITING');

  const docIds = [...new Set(myWaiting.map(s => s.doc_id))];
  if (!docIds.length) return [];

  const docs = await fetchAll('documents');
  return docs.filter(d => docIds.includes(d.id) && d.status === 'PENDING');
}

/* =====================================================
   결재 스텝 관련
   ===================================================== */
async function getStepsByDocId(docId) {
  const steps = await fetchAll('approval_steps');
  return steps
    .filter(s => s.doc_id === docId)
    .sort((a, b) => (a.step || 0) - (b.step || 0));
}

async function createApprovalStep(data) {
  return API.post('approval_steps', data);
}

async function updateApprovalStep(id, data) {
  return API.patch('approval_steps', id, data);
}

/* =====================================================
   결재 처리 (processApproval)
   ===================================================== */
async function processApproval(docId, approverId, action, comment = '') {
  const steps = await getStepsByDocId(docId);
  const doc   = await getDocumentById(docId);

  // 내 스텝 찾기 (WAITING 상태만)
  const myStep = steps.find(s => s.approver_id === approverId && s.status === 'WAITING');
  if (!myStep) throw new Error('처리할 결재 스텝을 찾을 수 없습니다.');

  const now = new Date().toISOString();
  const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

  await updateApprovalStep(myStep.id, {
    status: newStatus,
    acted_at: now,
    comment
  });

  if (action === 'REJECT') {
    // 반려: 즉시 REJECTED + 나머지 WAITING → SKIPPED
    await updateDocument(docId, { status: 'REJECTED' });
    const remaining = steps.filter(s => s.id !== myStep.id && s.status === 'WAITING');
    for (const s of remaining) {
      await updateApprovalStep(s.id, { status: 'SKIPPED', acted_at: now });
    }

    // ── 연차신청서 반려 시 → 이미 일부 승인된 경우 사용 일수 환원 ──
    // (중간 반려: 문서가 PENDING 상태에서 반려되므로 아직 차감 전 → 환원 불필요)
    // 단, 만약 이미 APPROVED 처리 후 재반려 케이스 대비
    if (doc.doc_type === 'VAC' && doc.status === 'APPROVED') {
      try {
        const body = JSON.parse(doc.body || '{}');
        const days = body.days || 0;
        const year = doc.year || todayYear();
        if (days > 0) await restoreLeave(doc.drafter_id, year, days);
      } catch (e) { console.warn('[leave restore on reject]', e); }
    }

    await writeAuditLog('REJECT', approverId, '', docId, `${doc.title} 반려 - ${comment}`);
    return { result: 'REJECTED' };
  }

  // 승인: 전체 비참조 스텝 모두 APPROVED 여부 확인
  const updatedSteps = await getStepsByDocId(docId);
  const nonRefSteps  = updatedSteps.filter(s => !s.is_ref);
  const allApproved  = nonRefSteps.every(s => s.status === 'APPROVED');

  if (allApproved) {
    await updateDocument(docId, { status: 'APPROVED' });

    // ── 연차신청서 최종승인 시 → 잔여연차 자동 차감 ──
    if (doc.doc_type === 'VAC') {
      try {
        const body = JSON.parse(doc.body || '{}');
        const days = body.days || 0;
        const year = doc.year || todayYear();
        if (days > 0) {
          await deductLeave(doc.drafter_id, doc.drafter_name, year, days);
        }
      } catch (e) { console.warn('[leave deduct]', e); }
    }

    await writeAuditLog('APPROVE', approverId, '', docId, `${doc.title} 최종 승인 완료`);
    return { result: 'APPROVED' };
  }

  await writeAuditLog('APPROVE', approverId, '', docId, `${doc.title} 결재 승인 (${myStep.step}단계)`);
  return { result: 'PARTIAL' };
}

/* ── 현재 내가 결재 처리 가능한지 확인 ── */
async function canIApprove(docId, userId) {
  const steps = await getStepsByDocId(docId);
  const myStep = steps.find(s => s.approver_id === userId && s.status === 'WAITING');
  return !!myStep;
}

/* =====================================================
   감사로그
   ===================================================== */
async function writeAuditLog(eventType, actorId, actorName, docId, detail) {
  try {
    await API.post('audit_logs', {
      event_type: eventType,
      actor_id:   actorId,
      actor_name: actorName,
      doc_id:     docId,
      detail
    });
  } catch (e) {
    console.warn('[Audit] log write failed', e);
  }
}

async function getAuditLogs(limit = 100) {
  const logs = await fetchAll('audit_logs');
  return logs.sort((a, b) => (b.created_at || 0) - (a.created_at || 0)).slice(0, limit);
}

/* =====================================================
   결재선 템플릿
   ===================================================== */
async function getApprovalTemplates() {
  return fetchAll('approval_templates');
}

async function createApprovalTemplate(data) {
  return API.post('approval_templates', data);
}

async function updateApprovalTemplate(id, data) {
  return API.patch('approval_templates', id, data);
}

async function deleteApprovalTemplate(id) {
  return API.delete('approval_templates', id);
}

/* =====================================================
   doc_seq 현황
   ===================================================== */
async function getDocSeqStatus() {
  return fetchAll('doc_seq');
}

/* =====================================================
   유틸리티
   ===================================================== */
function formatDate(isoOrMs) {
  if (!isoOrMs) return '-';
  const d = typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);
  if (isNaN(d)) return isoOrMs;
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '');
}

function formatDateTime(isoOrMs) {
  if (!isoOrMs) return '-';
  const d = typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);
  if (isNaN(d)) return String(isoOrMs);
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

function getStatusBadge(status) {
  const map = {
    DRAFT:     { cls: 'badge-draft',     text: '임시저장' },
    PENDING:   { cls: 'badge-pending',   text: '결재중' },
    APPROVED:  { cls: 'badge-approved',  text: '승인완료' },
    REJECTED:  { cls: 'badge-rejected',  text: '반려' },
    CANCELLED: { cls: 'badge-cancelled', text: '취소' }
  };
  const s = map[status] || { cls: 'badge-draft', text: status };
  return `<span class="badge ${s.cls}">${s.text}</span>`;
}

function getStepStatusBadge(status) {
  const map = {
    WAITING:  { cls: 'badge-waiting',  text: '대기' },
    APPROVED: { cls: 'badge-approved', text: '승인' },
    REJECTED: { cls: 'badge-rejected', text: '반려' },
    SKIPPED:  { cls: 'badge-draft',    text: '건너뜀' }
  };
  const s = map[status] || { cls: 'badge-draft', text: status };
  return `<span class="badge ${s.cls}">${s.text}</span>`;
}

function getDocTypeName(docType) {
  return docType === 'VAC' ? '연차신청서' : docType === 'OVT' ? '연장근무신청서' : docType;
}

function getRoleLabel(role) {
  return role === 'ADMIN' ? '관리자' : role === 'MANAGER' ? '매니저' : '직원';
}

function getRoleColor(role) {
  return role === 'ADMIN' ? 'badge-rejected' : role === 'MANAGER' ? 'badge-warning' : 'badge-primary';
}

function uuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

/* 연차 계산 */
function calcVacDays(startDate, endDate, vacType) {
  if (!startDate || !endDate) return 0;
  const s = new Date(startDate);
  const e = new Date(endDate);
  if (isNaN(s) || isNaN(e) || e < s) return 0;

  if (vacType === 'HALF_AM' || vacType === 'HALF_PM') return 0.5;

  let days = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) days++;
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function getVacTypeName(type) {
  const map = {
    FULL: '연차', HALF_AM: '오전반차', HALF_PM: '오후반차',
    SICK: '병가', SPECIAL: '특별휴가'
  };
  return map[type] || type;
}

/* 오늘 날짜 (YYYY-MM-DD) */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function todayYear() {
  return new Date().getFullYear().toString();
}

/* =====================================================
   연차 관련 API / 계산 함수
   ===================================================== */

/* ── 연차 발생일수 계산 ──
   - 1년 미만: 입사 당월 포함, 매월 1일 (최대 11일)
   - 1년 이상: 해당 연도 1월 1일 기준 만 근속연수 사용
               15일 기본, 2년마다 +1일, 최대 25일
   기준: 회계연도 1/1 시점에 몇 년 근속했는지로 계산
*/
function calcLeaveEntitlement(joinDateStr, targetYear) {
  if (!joinDateStr) return 0;
  const join    = new Date(joinDateStr);
  const yearInt = parseInt(targetYear);
  const yearStart = new Date(`${yearInt}-01-01`); // 해당 연도 1/1
  const yearEnd   = new Date(`${yearInt}-12-31`);

  // 아직 입사 안 한 경우 (입사일이 연도말 이후)
  if (join > yearEnd) return 0;

  // ── 연도 1/1 기준 만 근속연수 ──
  // "연도 첫날(1/1) 시점에 입사 기념일이 몇 번 지났나"
  let fullyears = yearInt - join.getFullYear();
  // 연도 첫날(1/1)에 아직 기념일이 안 지났으면 1년 빼기
  const anniversaryAtYearStart = new Date(yearInt, join.getMonth(), join.getDate());
  if (anniversaryAtYearStart > yearStart) fullyears -= 1;

  if (fullyears < 1) {
    // 1년 미만: 입사 당월 포함하여 연말까지 월수 × 1일 (최대 11일)
    // 해당 연도 이전 입사자는 1/1부터 카운트
    const startCount = join >= yearStart ? join : yearStart;
    // 입사 당월(= startCount의 달)부터 12월까지
    const months = 12 - startCount.getMonth(); // getMonth()는 0-based → 0=1월, 11=12월
    return Math.min(Math.max(months, 0), 11);
  }

  // 1년 이상: 15일 기본 + 2년마다 +1일 (최대 25일)
  const bonus = Math.floor((fullyears - 1) / 2);
  return Math.min(15 + bonus, 25);
}

/* ── leave_balances 테이블 CRUD ── */
async function getLeaveBalance(userId, year) {
  const all = await fetchAll('leave_balances');
  return all.find(r => r.user_id === userId && r.year === year) || null;
}

async function getAllLeaveBalances(year) {
  const all = await fetchAll('leave_balances');
  return all.filter(r => r.year === year);
}

async function upsertLeaveBalance(userId, userName, year, totalDays, usedDays) {
  const exist = await getLeaveBalance(userId, year);
  const remain = Math.max(totalDays - usedDays, 0);
  const data   = { user_id: userId, user_name: userName, year,
                   total_days: totalDays, used_days: usedDays, remain_days: remain };
  if (exist) {
    return API.patch('leave_balances', exist.id, data);
  } else {
    return API.post('leave_balances', data);
  }
}

/* ── 연차신청서 승인 완료 시 사용일수 자동 차감 ── */
async function deductLeave(userId, userName, year, days) {
  const bal = await getLeaveBalance(userId, year);
  if (!bal) return;
  const newUsed   = (bal.used_days || 0) + days;
  const newRemain = Math.max((bal.total_days || 0) - newUsed, 0);
  await API.patch('leave_balances', bal.id, {
    used_days: newUsed, remain_days: newRemain
  });
}

/* ── 연차신청서 취소/반려 시 사용일수 환원 ── */
async function restoreLeave(userId, year, days) {
  const bal = await getLeaveBalance(userId, year);
  if (!bal) return;
  const newUsed   = Math.max((bal.used_days || 0) - days, 0);
  const newRemain = Math.max((bal.total_days || 0) - newUsed, 0);
  await API.patch('leave_balances', bal.id, {
    used_days: newUsed, remain_days: newRemain
  });
}

/* ── 연도 변경 시 전 직원 연차 자동 갱신 (로그인 시 호출) ──
   - 해당 연도 레코드가 없으면 자동 생성
   - 이미 있으면 total_days만 재계산(입사일 기준) — used_days는 건드리지 않음
*/
async function syncLeaveBalancesIfNeeded() {
  const year  = todayYear();
  const users = await getAllUsers();
  // 활성 직원만 (admin 계정 제외, 이지숙 제외)
  const activeUsers = users.filter(u => u.active && u.emp_no !== 'admin');

  for (const u of activeUsers) {
    const total = calcLeaveEntitlement(u.join_date, year);
    const exist = await getLeaveBalance(u.id, year);

    if (!exist) {
      // 초기 생성: used_days 0으로 시작
      await API.post('leave_balances', {
        user_id: u.id, user_name: u.name, year,
        total_days: total, used_days: 0, remain_days: total
      });
    } else {
      // 기존 레코드가 있으면 절대 덮어쓰지 않음
      // (관리자가 직접 입력한 값 보존 — total_days, used_days, remain_days 모두 유지)
    }
  }
}
