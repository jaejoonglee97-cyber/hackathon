/**
 * Google Sheets 통합 DB 레이어
 *
 * 요구사항(TICKET-01):
 * - getRowBy(sheetName, columnName, value)
 * - listRows(sheetName, filters?)
 * - appendRow(sheetName, rowObject)
 * - updateRow(sheetName, keyColumn, keyValue, patchObject)
 * - 헤더(1행) 기준 columnName → index 자동 매핑
 * - 모든 write → audit_events 자동 기록
 */

import { google, sheets_v4 } from 'googleapis';
import {
    sheets,
    SheetName,
    getSpreadsheetId,
    AUTH_SHEET_ID,
    DATA_SHEET_ID,
} from './schema';

// ─────────────────────────────────────────────
// 환경 & 클라이언트
// ─────────────────────────────────────────────
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export const IS_DEV_MODE =
    !AUTH_SHEET_ID || !DATA_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY;

let client: sheets_v4.Sheets | null = null;

if (!IS_DEV_MODE) {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: GOOGLE_PRIVATE_KEY,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    client = google.sheets({ version: 'v4', auth });
} else {
    console.log('⚠️ [DEV MODE] 환경변수 미설정 → 샘플 데이터 사용');
}

// ─────────────────────────────────────────────
// 개발용 인메모리 스토어
// ─────────────────────────────────────────────
const SAMPLE_DATA: Record<string, Record<string, string>[]> = {
    users_auth: [],
    users_profile: [],
    teams: [
        {
            id: '1',
            name: '케어링크',
            org: '서울시복지재단',
            member_ids: '["user_1"]',
            stage: 'validate',
            created_at: '2026-02-01T10:00:00Z',
            updated_at: '2026-02-06T15:00:00Z',
        },
    ],
    team_members: [],
    projects: [
        {
            team_id: '1',
            problem_statement: '독거노인 안부 확인에 매일 2시간 소요',
            target_audience: '독거노인 담당 사회복지사',
            situation: '매일 아침 9시~11시',
            evidence1: '인터뷰: \"전화 연결이 안 되면 계속 재시도\"',
            evidence2: '업무로그: 하루 평균 50건 전화',
            evidence3: '관찰: 전화 후 수기 기록 30분 소요',
            hypothesis1: '자동 문자 알림 시 응답률 50% 향상',
            hypothesis2: '음성 인식 기록 시 입력 시간 80% 단축',
            solution: '자동 안부 확인 시스템',
            features: '1) 자동 문자 2) 응답 집계 3) 음성 기록',
            prototype_link: '',
            github_link: '',
            experiment_log: '10명 대상 2주 테스트',
            wrong_assumption: '노인분들이 문자를 못 읽을 것',
            next_test: '음성 통화 자동화 테스트',
            adoption_checklist: '1) 전화번호 DB 2) SMS 권한',
            updated_at: '2026-02-06T15:00:00Z',
        },
    ],
    // help_cards and insight_cards removed from SAMPLE_DATA
    feedbacks: [],
    config: [
        { key: 'consent_version', value: 'v1.0', description: '현재 동의서 버전' },
    ],
    config_deadlines: [
        {
            phase: 'doc_submit',
            due_at: '2026-02-13T23:59:59Z',
            lock_mode: 'soft',
            is_active: 'TRUE',
            message: '1차 문서 제출 마감',
        },
    ],
    audit_events: [],
    visitors: [],
    scores: [],
};

// ─────────────────────────────────────────────
// 내부 헬퍼: 시트 읽기(raw 2D 배열)
// ─────────────────────────────────────────────
async function readRawRows(
    sheetName: SheetName,
): Promise<{ headers: string[]; dataRows: string[][] }> {
    const def = sheets[sheetName];

    if (IS_DEV_MODE) {
        const rows = SAMPLE_DATA[def.tab] ?? [];
        const headers = [...def.columns];
        const dataRows = rows.map((row) => headers.map((h) => row[h] ?? ''));
        return { headers, dataRows };
    }

    const spreadsheetId = getSpreadsheetId(def.sheetId);
    const range = `${def.tab}!A1:ZZ`;

    const response = await client!.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    const raw = response.data.values ?? [];
    if (raw.length === 0) return { headers: [...def.columns], dataRows: [] };

    const headers = raw[0] as string[];
    const dataRows = raw.slice(1) as string[][];
    return { headers, dataRows };
}

/** 헤더 → 인덱스 맵 생성 */
function buildColumnMap(headers: string[]): Map<string, number> {
    const map = new Map<string, number>();
    headers.forEach((h, i) => map.set(h, i));
    return map;
}

/** 행 배열 → 객체 변환 */
function rowToObject(headers: string[], row: string[]): Record<string, string> {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
        obj[h] = row[i] ?? '';
    });
    return obj;
}

/** 0-based 컬럼 인덱스 → 스프레드시트 컬럼 문자 (A..Z, AA..AZ, ...) */
function colIndexToLetter(index: number): string {
    let result = '';
    let n = index;
    while (n >= 0) {
        result = String.fromCharCode(65 + (n % 26)) + result;
        n = Math.floor(n / 26) - 1;
    }
    return result;
}

// ─────────────────────────────────────────────
// 공개 API
// ─────────────────────────────────────────────

/**
 * 특정 컬럼 값으로 **첫 번째** 매칭 행 반환
 */
export async function getRowBy(
    sheetName: SheetName,
    columnName: string,
    value: string,
): Promise<Record<string, string> | null> {
    const { headers, dataRows } = await readRawRows(sheetName);
    const colMap = buildColumnMap(headers);
    const colIdx = colMap.get(columnName);
    if (colIdx === undefined) {
        console.warn(`[getRowBy] column '${columnName}' not found in ${sheetName}`);
        return null;
    }

    for (const row of dataRows) {
        if (row[colIdx] === value) {
            return rowToObject(headers, row);
        }
    }
    return null;
}

/**
 * 조건에 맞는 행 목록 반환
 * filters: { columnName: value } (AND 조건, 모두 일치해야 함)
 * 필터가 비어 있으면 전체 반환
 */
export async function listRows(
    sheetName: SheetName,
    filters?: Record<string, string>,
): Promise<Record<string, string>[]> {
    const { headers, dataRows } = await readRawRows(sheetName);
    const colMap = buildColumnMap(headers);

    let result = dataRows.map((row) => rowToObject(headers, row));

    if (filters && Object.keys(filters).length > 0) {
        result = result.filter((row) =>
            Object.entries(filters).every(([col, val]) => row[col] === val),
        );
    }

    return result;
}

/**
 * 새 행 추가
 * rowObject: { columnName: value } 형태 — 누락 컬럼은 '' 으로 채움
 */
export async function appendRow(
    sheetName: SheetName,
    rowObject: Record<string, string>,
    auditInfo?: { actorUserId: string; action: string; targetType?: string; targetId?: string; meta?: Record<string, unknown> },
): Promise<void> {
    const def = sheets[sheetName];
    const values = def.columns.map((col) => rowObject[col] ?? '');

    if (IS_DEV_MODE) {
        console.log(`[DEV] appendRow(${def.tab})`, rowObject);
        if (!SAMPLE_DATA[def.tab]) SAMPLE_DATA[def.tab] = [];
        const obj: Record<string, string> = {};
        def.columns.forEach((col, i) => {
            obj[col] = values[i];
        });
        SAMPLE_DATA[def.tab].push(obj);
    } else {
        const spreadsheetId = getSpreadsheetId(def.sheetId);
        await client!.spreadsheets.values.append({
            spreadsheetId,
            range: `${def.tab}!A1`,
            valueInputOption: 'RAW',
            requestBody: { values: [values] },
        });
    }

    // audit 기록 (audit_events 자체를 쓸 때는 재귀 방지)
    if (auditInfo && sheetName !== 'audit_events') {
        await writeAuditEvent(
            auditInfo.actorUserId,
            auditInfo.action,
            auditInfo.targetType ?? def.tab,
            auditInfo.targetId ?? values[0],
            auditInfo.meta ?? {},
        );
    }
}

/**
 * 기존 행 업데이트
 * keyColumn + keyValue 로 행을 찾고, patchObject 의 컬럼만 덮어씀
 */
export async function updateRow(
    sheetName: SheetName,
    keyColumn: string,
    keyValue: string,
    patchObject: Record<string, string | number>,
    auditInfo?: { actorUserId: string; action: string; targetType?: string; targetId?: string; meta?: Record<string, unknown> },
): Promise<void> {
    const def = sheets[sheetName];

    if (IS_DEV_MODE) {
        console.log(`[DEV] updateRow(${def.tab}) where ${keyColumn}=${keyValue}`, patchObject);
        const rows = SAMPLE_DATA[def.tab] ?? [];
        const idx = rows.findIndex((r) => r[keyColumn] === keyValue);
        if (idx >= 0) {
            Object.entries(patchObject).forEach(([k, v]) => {
                rows[idx][k] = String(v);
            });
            if (def.columns.includes('updated_at')) {
                rows[idx].updated_at = new Date().toISOString();
            }
        }
    } else {
        // 전체 읽기
        const spreadsheetId = getSpreadsheetId(def.sheetId);
        const range = `${def.tab}!A1:ZZ`;
        const response = await client!.spreadsheets.values.get({ spreadsheetId, range });
        const raw = response.data.values ?? [];
        if (raw.length === 0) throw new Error(`No data in ${def.tab}`);

        const headers = raw[0] as string[];
        const dataRows = raw.slice(1) as string[][];
        const colMap = buildColumnMap(headers);

        const keyIdx = colMap.get(keyColumn);
        if (keyIdx === undefined) throw new Error(`Column '${keyColumn}' not found in ${def.tab}`);

        const rowIdx = dataRows.findIndex((r) => r[keyIdx] === keyValue);
        if (rowIdx === -1) throw new Error(`Row with ${keyColumn}=${keyValue} not found in ${def.tab}`);

        const updatedRow = [...dataRows[rowIdx]];
        // 행이 헤더보다 짧을 수 있으므로 패딩
        while (updatedRow.length < headers.length) updatedRow.push('');

        Object.entries(patchObject).forEach(([k, v]) => {
            const ci = colMap.get(k);
            if (ci !== undefined) updatedRow[ci] = String(v);
        });

        // updated_at 자동 갱신
        const uaIdx = colMap.get('updated_at');
        if (uaIdx !== undefined) {
            updatedRow[uaIdx] = new Date().toISOString();
        }

        const actualRow = rowIdx + 2; // 헤더 + 0-index
        const endCol = colIndexToLetter(headers.length - 1);
        const updateRange = `${def.tab}!A${actualRow}:${endCol}${actualRow}`;

        await client!.spreadsheets.values.update({
            spreadsheetId,
            range: updateRange,
            valueInputOption: 'RAW',
            requestBody: { values: [updatedRow] },
        });
    }

    // audit
    if (auditInfo && sheetName !== 'audit_events') {
        await writeAuditEvent(
            auditInfo.actorUserId,
            auditInfo.action,
            auditInfo.targetType ?? def.tab,
            auditInfo.targetId ?? keyValue,
            auditInfo.meta ?? patchObject,
        );
    }
}

/**
 * 행 삭제 (keyColumn 기준 일치하는 첫 번째 행)
 */
export async function deleteRow(
    sheetName: SheetName,
    keyColumn: string,
    keyValue: string,
    auditInfo?: { actorUserId: string; action: string; targetType?: string; targetId?: string; meta?: Record<string, unknown> },
): Promise<void> {
    const def = sheets[sheetName];

    if (IS_DEV_MODE) {
        console.log(`[DEV] deleteRow(${def.tab}) where ${keyColumn}=${keyValue}`);
        const rows = SAMPLE_DATA[def.tab] ?? [];
        const idx = rows.findIndex((r) => r[keyColumn] === keyValue);
        if (idx >= 0) {
            rows.splice(idx, 1);
        }
    } else {
        const spreadsheetId = getSpreadsheetId(def.sheetId);

        // 1. Find the row index first
        const range = `${def.tab}!A1:ZZ`;
        const response = await client!.spreadsheets.values.get({ spreadsheetId, range });
        const raw = response.data.values ?? [];
        if (raw.length === 0) throw new Error(`No data in ${def.tab}`);

        const headers = raw[0] as string[];
        const dataRows = raw.slice(1) as string[][];
        const colMap = buildColumnMap(headers);

        const keyIdx = colMap.get(keyColumn);
        if (keyIdx === undefined) throw new Error(`Column '${keyColumn}' not found in ${def.tab}`);

        const rowIdx = dataRows.findIndex((r) => r[keyIdx] === keyValue);
        if (rowIdx === -1) throw new Error(`Row with ${keyColumn}=${keyValue} not found in ${def.tab}`);

        // The row index in the sheet is (header + dataRows index)
        // DataRows index starts at 0 for the first data row (which is physically row 2)
        // So physical row index = rowIdx + 2
        // But the API uses 0-based index. So row 1 (header) is index 0. row 2 (first data) is index 1.
        // So the index to delete is `rowIdx + 1`.
        const deleteIndex = rowIdx + 1;

        // 2. Find sheetId (number) for the tab name
        const gridMeta = await client!.spreadsheets.get({ spreadsheetId });
        const sheet = gridMeta.data.sheets?.find(s => s.properties?.title === def.tab);
        const sheetIdNumeric = sheet?.properties?.sheetId;

        if (sheetIdNumeric === undefined) throw new Error(`Sheet tab '${def.tab}' not found`);

        await client!.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheetIdNumeric,
                                dimension: 'ROWS',
                                startIndex: deleteIndex,
                                endIndex: deleteIndex + 1,
                            },
                        },
                    },
                ],
            },
        });
    }

    // audit
    if (auditInfo && sheetName !== 'audit_events') {
        const meta = auditInfo.meta || {};
        meta.deleted = true;
        await writeAuditEvent(
            auditInfo.actorUserId,
            auditInfo.action,
            auditInfo.targetType ?? def.tab,
            auditInfo.targetId ?? keyValue,
            meta,
        );
    }
}

// ─────────────────────────────────────────────
// audit_events 기록 (내부)
// ─────────────────────────────────────────────
async function writeAuditEvent(
    actorUserId: string,
    action: string,
    targetType: string,
    targetId: string,
    meta: Record<string, unknown>,
): Promise<void> {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    try {
        await appendRow('audit_events', {
            event_id: eventId,
            actor_user_id: actorUserId,
            action,
            target_type: targetType,
            target_id: targetId,
            meta_json: JSON.stringify(meta),
            created_at: now,
        });
    } catch (err) {
        // audit 실패는 치명적이지 않으므로 로그만 남김
        console.error('[audit] Failed to write audit event:', err);
    }
}

// ─────────────────────────────────────────────
// 편의 헬퍼
// ─────────────────────────────────────────────

/** 사용자 인증 정보 조회 (email 기준) */
export async function getUserAuth(email: string) {
    return getRowBy('users_auth', 'email', email);
}

/** 사용자 프로필 조회 (user_id 기준) */
export async function getUserProfile(userId: string) {
    return getRowBy('users_profile', 'user_id', userId);
}

/** config 값 조회 */
export async function getConfigValue(key: string): Promise<string | null> {
    const row = await getRowBy('config', 'key', key);
    return row?.value || null;
}

/** config_deadlines 에서 활성 마감일 목록 조회 (TICKET-05) */
export async function getActiveDeadlines(): Promise<
    Array<{ phase: string; due_at: string; lock_mode: 'soft' | 'hard'; message: string }>
> {
    const rows = await listRows('config_deadlines', { is_active: 'TRUE' });
    return rows.map((r) => ({
        phase: r.phase,
        due_at: r.due_at,
        lock_mode: r.lock_mode as 'soft' | 'hard',
        message: r.message,
    }));
}

/** 특정 phase의 잠금 상태 확인 (TICKET-05) */
export async function checkDeadlineLock(phase: string): Promise<{
    locked: boolean;
    lockMode?: 'soft' | 'hard';
    dueAt?: Date;
    message?: string;
}> {
    const deadlines = await getActiveDeadlines();
    const dl = deadlines.find((d) => d.phase === phase);
    if (!dl) return { locked: false };

    const dueAt = new Date(dl.due_at);
    const now = new Date();

    if (now > dueAt) {
        return { locked: true, lockMode: dl.lock_mode, dueAt, message: dl.message };
    }
    return { locked: false, dueAt, message: dl.message };
}

/** 프로필 완료 여부 확인 — 빈칸·FALSE = 미완료, TRUE = 완료 */
export function isProfileComplete(profile: Record<string, string> | null): boolean {
    if (!profile) return false;
    return profile.profile_complete === 'TRUE';
}

/** 사용자의 프로필 완료 여부 + 프로필 데이터 반환 */
export async function checkProfileComplete(userId: string): Promise<{
    complete: boolean;
    profile: Record<string, string> | null;
}> {
    const profile = await getUserProfile(userId);
    return { complete: isProfileComplete(profile), profile };
}

/**
 * 심사 upsert — team_id + judge_id 조합으로 이미 있으면 update, 없으면 append
 */
export async function upsertScore(
    judgeId: string,
    teamId: string,
    patch: Record<string, string | number>,
): Promise<void> {
    // 기존 심사 행 조회
    const rows = await listRows('scores', { team_id: teamId, judge_id: judgeId });
    const existing = rows[0];

    if (existing) {
        // 기존 행 업데이트 (score_id 키 기준)
        await updateRow('scores', 'score_id', existing.score_id, patch, {
            actorUserId: judgeId,
            action: 'score_update',
            targetType: 'scores',
            targetId: teamId,
        });
    } else {
        // 신규 횟 입력
        const scoreId = `score_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const now = new Date().toISOString();
        await appendRow(
            'scores',
            {
                score_id: scoreId,
                team_id: teamId,
                judge_id: judgeId,
                field_relevance: String(patch.field_relevance ?? 0),
                feasibility: String(patch.feasibility ?? 0),
                outcomes: String(patch.outcomes ?? 0),
                scalability: String(patch.scalability ?? 0),
                safety: String(patch.safety ?? 0),
                deduction: String(patch.deduction ?? 0),
                deduction_reasons: String(patch.deduction_reasons ?? ''),
                comment: String(patch.comment ?? ''),
                is_submitted: String(patch.is_submitted ?? 'FALSE'),
                submitted_at: patch.is_submitted === 'TRUE' ? now : '',
                updated_at: now,
            },
            {
                actorUserId: judgeId,
                action: 'score_create',
                targetType: 'scores',
                targetId: teamId,
            },
        );
    }
}
