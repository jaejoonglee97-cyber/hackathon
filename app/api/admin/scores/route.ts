// app/api/admin/scores/route.ts
// FR-32: 심사(비공개) API — judge/admin 전용
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { listRows, upsertScore } from '@/lib/sheets';

function isJudgeOrAdmin(role: string) {
    return ['admin', 'judge'].includes(role);
}

/**
 * GET /api/admin/scores?teamId=&judgeId=
 * - judgeId 생략 시 해당 팀의 모든 심사위원 점수 반환 (admin 전용)
 * - judgeId 지정 시 해당 심사위원의 점수 1건만 반환
 */
export async function GET(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user || !isJudgeOrAdmin(user.role)) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');
    const judgeId = searchParams.get('judgeId');

    // judge는 본인 심사만 조회 가능
    if (user.role === 'judge' && judgeId && judgeId !== user.userId) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const filters: Record<string, string> = {};
    if (teamId) filters.team_id = teamId;
    // judge는 항상 본인 것만, admin은 judgeId 파라미터 따름
    if (user.role === 'judge') {
        filters.judge_id = user.userId;
    } else if (judgeId) {
        filters.judge_id = judgeId;
    }

    const rows = await listRows('scores', filters);
    return NextResponse.json({ scores: rows });
}

/**
 * POST /api/admin/scores
 * body: {
 *   teamId: string,
 *   fieldRelevance: number,  // 0~20
 *   feasibility: number,
 *   outcomes: number,
 *   scalability: number,
 *   safety: number,
 *   deductionReasons: string[],  // ['pii', 'open_edit', 'internal_leak']
 *   comment: string,
 *   isSubmitted: boolean,  // false=임시저장, true=최종제출
 * }
 */
export async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    // 심사 저장은 judge만 가능 (admin은 집계 조회만)
    if (!user || user.role !== 'judge') {
        return NextResponse.json({ error: '심사위원만 심사할 수 있습니다.' }, { status: 403 });
    }

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
    }

    const {
        teamId,
        fieldRelevance = 0,
        feasibility = 0,
        outcomes = 0,
        scalability = 0,
        safety = 0,
        deductionReasons = [],
        bonusReasons = [],
        comment = '',
        isSubmitted = false,
    } = body;

    if (!teamId) {
        return NextResponse.json({ error: 'teamId가 필요합니다.' }, { status: 400 });
    }

    // 각 항목 범위 검증
    const items = { fieldRelevance, feasibility, outcomes, scalability, safety };
    for (const [key, val] of Object.entries(items)) {
        if (typeof val !== 'number' || val < 0 || val > 20) {
            return NextResponse.json(
                { error: `${key}는 0~20 사이의 숫자여야 합니다.` },
                { status: 400 },
            );
        }
    }

    const deduction = deductionReasons.length > 0 ? -10 : 0;
    const bonus = bonusReasons.length > 0 ? 5 : 0;
    const now = new Date().toISOString();

    await upsertScore(user.userId, teamId, {
        field_relevance: fieldRelevance,
        feasibility,
        outcomes,
        scalability,
        safety,
        deduction,
        deduction_reasons: deductionReasons.join(','),
        bonus,
        bonus_reasons: bonusReasons.join(','),
        comment,
        is_submitted: isSubmitted ? 'TRUE' : 'FALSE',
        submitted_at: isSubmitted ? now : '',
        updated_at: now,
    });

    return NextResponse.json({ ok: true, message: isSubmitted ? '최종 제출되었습니다.' : '임시저장되었습니다.' });
}
