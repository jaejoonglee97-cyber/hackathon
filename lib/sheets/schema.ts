/**
 * Google Sheets 스키마 상수 — 단일 소스 오브 트루스(Single Source of Truth)
 *
 * ⚠️  탭 이름·컬럼 이름 변경은 반드시 이 파일에서만 수행한다.
 *     다른 파일에서 시트 탭/컬럼을 하드코딩하면 안 됨.
 *
 * 구조:
 *   sheets.{tabKey}.tab       — 시트 탭 이름 (예: 'users_auth')
 *   sheets.{tabKey}.sheetId   — 'auth' | 'data'
 *   sheets.{tabKey}.columns   — 컬럼 이름 배열 (헤더 1행 순서)
 */

// ─────────────────────────────────────────────
// 1) 환경변수: 스프레드시트 ID
// ─────────────────────────────────────────────
export const AUTH_SHEET_ID = process.env.AUTH_SHEET_ID ?? '';
export const DATA_SHEET_ID = process.env.DATA_SHEET_ID ?? '';

export type SheetType = 'auth' | 'data';

export function getSpreadsheetId(type: SheetType): string {
    return type === 'auth' ? AUTH_SHEET_ID : DATA_SHEET_ID;
}

// ─────────────────────────────────────────────
// 2) 탭 + 컬럼 정의
// ─────────────────────────────────────────────
interface SheetDef {
    /** 시트 탭 이름 */
    tab: string;
    /** 어떤 스프레드시트에 속하는지 */
    sheetId: SheetType;
    /** 컬럼 헤더 순서 (1행) */
    columns: readonly string[];
}

function def(tab: string, sheetId: SheetType, columns: readonly string[]): SheetDef {
    return { tab, sheetId, columns } as const;
}

export const sheets = {
    // ── AUTH_SHEET ──────────────────────────────
    users_auth: def('users_auth', 'auth', [
        'user_id',
        'email',
        'password_hash',
        'role',
        'status',
        'failed_count',
        'locked_until',
        'last_login_at',
        'created_at',
        'updated_at',
    ] as const),

    // ── DATA_SHEET ─────────────────────────────
    users_profile: def('users_profile', 'data', [
        'user_id',
        'name',
        'phone',
        'org',
        'birthdate',
        'consent_version',
        'consented_at',
        'privacy_mask_level',
        'profile_complete',      // 'TRUE' | 'FALSE' | '' (빈칸 = FALSE)
        'profile_completed_at',  // ISO 8601 +09:00
        'participant_type',
    ] as const),

    teams: def('teams', 'data', [
        'id',
        'name',
        'org',
        'member_ids',
        'stage',
        'name_edit_count', // 프로젝트 이름 변경 횟수 (최대 3회)
        'created_at',
        'updated_at',
    ] as const),

    team_members: def('team_members', 'data', [
        'id',
        'team_id',
        'user_id',
        'role',
        'joined_at',
        'updated_at',
    ] as const),

    projects: def('projects', 'data', [
        'team_id',
        'track', // 분야 (현장 업무경감... 등)
        'problem_statement',
        'target_audience',
        'situation',
        'evidence1',
        'evidence2',
        'evidence3',
        'hypothesis1',
        'hypothesis2',
        'solution',
        'features',
        'prototype_link',
        'github_link',
        'experiment_log',
        'wrong_assumption',
        'next_test',
        'adoption_checklist',
        'updated_at',
    ] as const),

    // ── QnA (구 Help) ─────────────────────────
    inquiries: def('inquiries', 'data', [
        'id',
        'user_id',
        'title',
        'content',
        'is_secret',  // 'TRUE' | 'FALSE'
        'status',     // 'open' | 'answered'
        'answer',
        'answered_by',
        'created_at',
        'updated_at',
    ] as const),

    insight_cards: def('insight_cards', 'data', [
        'id',
        'team_id',
        'content',
        'category',
        'created_at',
        'updated_at',
    ] as const),

    feedbacks: def('feedbacks', 'data', [
        'id',
        'target_type',
        'target_id',
        'author_id',
        'body',
        'helpful_count',
        'created_at',
    ] as const),

    config: def('config', 'data', [
        'key',
        'value',
        'description',
    ] as const),

    /** TICKET-05: 마감 정책 전용 탭 */
    config_deadlines: def('config_deadlines', 'data', [
        'phase',
        'due_at',
        'lock_mode',
        'is_active',
        'message',
    ] as const),

    /** 감사(audit) 로그 — 모든 write 작업 자동 기록 */
    audit_events: def('audit_events', 'data', [
        'event_id',
        'actor_user_id',
        'action',
        'target_type',
        'target_id',
        'meta_json',
        'created_at',
    ] as const),
} as const;

// 타입 유틸
export type SheetName = keyof typeof sheets;
export type ColumnOf<T extends SheetName> = (typeof sheets)[T]['columns'][number];
