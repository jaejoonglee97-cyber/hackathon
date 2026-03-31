import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateRow } from '@/lib/sheets';

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        // 심사위원과 운영자 모두 가능
        if (!user || !['admin', 'judge'].includes(user.role)) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        const body = await req.json();
        const { teamId, screeningMemo } = body;

        if (!teamId) {
            return NextResponse.json({ error: 'teamId가 필요합니다.' }, { status: 400 });
        }

        await updateRow(
            'teams',
            'id',
            teamId,
            { screening_memo: screeningMemo || '' },
            {
                actorUserId: user.userId,
                action: 'screening_memo_update',
                targetType: 'teams',
                targetId: teamId,
            }
        );

        return NextResponse.json({ success: true, message: '1차 스크리닝 메모가 저장되었습니다.' });
    } catch (error: any) {
        console.error('Screening Memo Update Error:', error);
        return NextResponse.json(
            { error: error?.message || '저장 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
