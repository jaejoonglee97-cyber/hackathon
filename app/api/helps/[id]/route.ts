// API: Help 카드 수정(PATCH)/삭제(DELETE)
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

        const helpCard = await getRowBy('help_cards', 'id', params.id);
        if (!helpCard) {
            return NextResponse.json({ error: 'Help 카드를 찾을 수 없습니다.' }, { status: 404 });
        }

        const canEdit = await canEditCard(helpCard.team_id);
        if (!canEdit) {
            return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
        }

        const body = await request.json();
        const allowedFields = ['type', 'title', 'description', 'status'];
        const updates: Record<string, any> = {};

        allowedFields.forEach((field) => {
            if (field in body) updates[field] = body[field] || '';
        });

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: '업데이트할 내용이 없습니다.' }, { status: 400 });
        }

        if (updates.type && !['needed', 'offered'].includes(updates.type)) {
            return NextResponse.json({ error: 'type은 "needed" 또는 "offered"여야 합니다.' }, { status: 400 });
        }

        if (updates.status && !['open', 'closed'].includes(updates.status)) {
            return NextResponse.json({ error: 'status는 "open" 또는 "closed"여야 합니다.' }, { status: 400 });
        }

        await updateRow('help_cards', 'id', params.id, updates, {
            actorUserId: user.userId,
            action: 'update_help_card',
            targetId: params.id,
        });

        return NextResponse.json({ success: true, message: 'Help 카드가 업데이트되었습니다.' });
    } catch (error: any) {
        console.error('Help card update error:', error);
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

        const helpCard = await getRowBy('help_cards', 'id', params.id);
        if (!helpCard) {
            return NextResponse.json({ error: 'Help 카드를 찾을 수 없습니다.' }, { status: 404 });
        }

        const canEdit = await canEditCard(helpCard.team_id);
        if (!canEdit) {
            return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
        }

        await updateRow('help_cards', 'id', params.id, { status: 'deleted' }, {
            actorUserId: user.userId,
            action: 'delete_help_card',
            targetId: params.id,
        });

        return NextResponse.json({ success: true, message: 'Help 카드가 삭제되었습니다.' });
    } catch (error: any) {
        console.error('Help card delete error:', error);
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
