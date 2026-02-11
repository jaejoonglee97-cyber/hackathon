// API: Insight 카드 수정(PATCH)/삭제(DELETE)
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { canEditCard } from '@/lib/permissions';
import { updateRow, getRowBy } from '@/lib/sheets';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();

        const insightCard = await getRowBy('insight_cards', 'id', params.id);
        if (!insightCard) {
            return NextResponse.json({ error: 'Insight 카드를 찾을 수 없습니다.' }, { status: 404 });
        }

        const canEdit = await canEditCard(insightCard.team_id);
        if (!canEdit) {
            return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
        }

        const body = await request.json();
        const allowedFields = ['content', 'category'];
        const updates: Record<string, any> = {};

        allowedFields.forEach((field) => {
            if (field in body) updates[field] = body[field] || '';
        });

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: '업데이트할 내용이 없습니다.' }, { status: 400 });
        }

        await updateRow('insight_cards', 'id', params.id, updates, {
            actorUserId: user.userId,
            action: 'update_insight_card',
            targetId: params.id,
        });

        return NextResponse.json({ success: true, message: 'Insight 카드가 업데이트되었습니다.' });
    } catch (error: any) {
        console.error('Insight card update error:', error);
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        return NextResponse.json({ error: '업데이트 중 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();

        const insightCard = await getRowBy('insight_cards', 'id', params.id);
        if (!insightCard) {
            return NextResponse.json({ error: 'Insight 카드를 찾을 수 없습니다.' }, { status: 404 });
        }

        const canEdit = await canEditCard(insightCard.team_id);
        if (!canEdit) {
            return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
        }

        await updateRow('insight_cards', 'id', params.id, { category: 'deleted' }, {
            actorUserId: user.userId,
            action: 'delete_insight_card',
            targetId: params.id,
        });

        return NextResponse.json({ success: true, message: 'Insight 카드가 삭제되었습니다.' });
    } catch (error: any) {
        console.error('Insight card delete error:', error);
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
