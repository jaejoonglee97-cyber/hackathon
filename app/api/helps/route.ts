// API: Help 카드 목록(GET) + 생성(POST)  — TICKET-06
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { appendRow, listRows } from '@/lib/sheets';

/** GET /api/helps — Help 카드 목록 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get('team_id');
        const status = searchParams.get('status');

        // 필터 조건 구성
        const filters: Record<string, string> = {};
        if (teamId) filters.team_id = teamId;
        if (status) filters.status = status;

        const rows = await listRows('help_cards', Object.keys(filters).length > 0 ? filters : undefined);

        // soft-delete 된 것 제외
        const result = rows.filter((r) => r.status !== 'deleted');

        return NextResponse.json({ helps: result }, { status: 200 });
    } catch (error) {
        console.error('Help list error:', error);
        return NextResponse.json({ error: 'Help 목록 조회 중 오류' }, { status: 500 });
    }
}

/** POST /api/helps — Help 카드 생성 */
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();

        const { team_id, type, title, description } = body;

        // 필수 필드 검증
        if (!team_id || !type || !title || !description) {
            return NextResponse.json(
                { error: '필수 항목을 모두 입력해주세요.' },
                { status: 400 },
            );
        }

        // type 검증
        if (!['needed', 'offered'].includes(type)) {
            return NextResponse.json(
                { error: 'type은 "needed" 또는 "offered"여야 합니다.' },
                { status: 400 },
            );
        }

        const helpId = `help_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        await appendRow(
            'help_cards',
            {
                id: helpId,
                team_id,
                type,
                title,
                description,
                status: 'open',
                created_at: now,
                updated_at: now,
            },
            { actorUserId: user.userId, action: 'create_help_card', targetId: helpId },
        );

        return NextResponse.json(
            { success: true, message: 'Help 카드가 생성되었습니다.', helpId },
            { status: 201 },
        );
    } catch (error: any) {
        console.error('Help card creation error:', error);
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Help 카드 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
