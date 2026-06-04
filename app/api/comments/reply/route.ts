import { NextResponse } from 'next/server';
import { appendCommentRow } from '@/lib/sheets';
import { verifyToken, getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import type { Comment } from '@/types/archive';

export async function POST(request: Request) {
    try {
        // Auth check - can use header or cookie depending on how client sends it
        const user = await getCurrentUser();
        
        let tokenPayload = user;

        // If not found in cookie, try auth header
        if (!tokenPayload) {
            const authHeader = request.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                tokenPayload = verifyToken(token);
            }
        }

        if (!tokenPayload) {
             return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
        }

        const body = await request.json();
        const { appId, parentId, content } = body;

        // Validation
        if (!appId) {
            return NextResponse.json({ error: '앱 ID가 필요합니다' }, { status: 400 });
        }
        if (!content || content.length < 5) {
            return NextResponse.json({ error: '내용은 5자 이상이어야 합니다' }, { status: 400 });
        }

        const authorRole = tokenPayload.role === 'admin' ? 'admin' : 'manager';
        const authorName = tokenPayload.name || tokenPayload.email;
        const now = new Date().toISOString();

        const comment: Comment = {
            id: uuidv4(),
            appId,
            parentId,
            authorName,
            authorRole,
            content,
            passwordHash: '', // Admins/managers don't need a password to delete their own, or we don't support deleting yet
            isDeleted: false,
            createdAt: now,
        };

        await appendCommentRow(comment);

        const { passwordHash, ...publicComment } = comment;

        return NextResponse.json({ comment: publicComment }, { status: 201 });
    } catch (error) {
        console.error('Failed to create reply:', error);
        return NextResponse.json(
            { error: '답글을 작성하는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
