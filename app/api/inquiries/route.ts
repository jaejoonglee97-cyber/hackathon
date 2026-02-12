import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { appendRow, listRows, getRowBy } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const inquiries = await listRows('inquiries');

        // 민감한 정보(작성자 이름 등)는 클라이언트에서 처리하도록 원본 데이터를 보냄
        // 단, 비밀글 내용은 필터링할 필요가 있음 (여기서는 일단 다 보내고 클라이언트에서 처리하거나, 
        // 여기서 필터링할 수도 있음. 유저 정보를 같이 보내줘야 함)

        const currentUser = await getCurrentUser();

        // 사용자 이름 매핑을 위해 프로필 정보도 가져오면 좋지만, 일단은 ID만 보냄.
        // 클라이언트에서 처리.

        return NextResponse.json({ inquiries, currentUser });
    } catch (error) {
        console.error('Failed to fetch inquiries:', error);
        return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, isSecret } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const newTxId = uuidv4();
        const now = new Date().toISOString();

        await appendRow(
            'inquiries',
            {
                id: newTxId,
                user_id: currentUser.userId,
                title,
                content,
                is_secret: isSecret ? 'TRUE' : 'FALSE',
                status: 'open',
                answer: '',
                answered_by: '',
                created_at: now,
                updated_at: now,
            },
            {
                actorUserId: currentUser.userId,
                action: 'create_inquiry',
                targetType: 'inquiry',
                targetId: newTxId,
            }
        );

        return NextResponse.json({ success: true, id: newTxId });
    } catch (error) {
        console.error('Failed to create inquiry:', error);
        return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 });
    }
}
