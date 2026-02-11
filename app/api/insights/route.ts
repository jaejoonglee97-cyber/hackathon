// API: Insight 카드 목록(GET) + 생성(POST)
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { appendRow, listRows } from '@/lib/sheets';

/** GET /api/insights — Insight 카드 목록 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get('team_id');

        const filters: Record<string, string> = {};
        if (teamId) filters.team_id = teamId;

        const rows = await listRows('insight_cards', Object.keys(filters).length > 0 ? filters : undefined);
        const result = rows.filter((r) => r.category !== 'deleted');

        return NextResponse.json({ insights: result }, { status: 200 });
    } catch (error) {
        console.error('Insight list error:', error);
        return NextResponse.json({ error: 'Insight 목록 조회 중 오류' }, { status: 500 });
    }
}

/** POST /api/insights — Insight 카드 생성 */
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { team_id, content, category } = body;

        if (!team_id || !content) {
            return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
        }

        const insightId = `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        await appendRow(
            'insight_cards',
            {
                id: insightId,
                team_id,
                content,
                category: category || 'general',
                created_at: now,
                updated_at: now,
            },
            { actorUserId: user.userId, action: 'create_insight_card', targetId: insightId },
        );

        return NextResponse.json(
            { success: true, message: 'Insight 카드가 생성되었습니다.', insightId },
            { status: 201 },
        );
    } catch (error: any) {
        console.error('Insight card creation error:', error);
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Insight 카드 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
