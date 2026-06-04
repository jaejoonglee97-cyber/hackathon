import { NextResponse } from 'next/server';
import { getCommentsByAppId, appendCommentRow } from '@/lib/sheets';
import { hashPassword } from '@/lib/bcrypt';
import { v4 as uuidv4 } from 'uuid';
import type { Comment } from '@/types/archive';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    if (!appId) {
        return NextResponse.json({ error: '앱 ID가 필요합니다' }, { status: 400 });
    }

    try {
        const comments = await getCommentsByAppId(appId);
        
        // Remove passwordHash from response
        const publicComments = comments.map(({ passwordHash, ...rest }) => rest);
        
        return NextResponse.json({ comments: publicComments });
    } catch (error) {
        console.error('Failed to fetch comments:', error);
        return NextResponse.json(
            { error: '댓글을 불러오는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { appId, parentId, authorName, password, content } = body;

        // Validation
        if (!appId) {
            return NextResponse.json({ error: '앱 ID가 필요합니다' }, { status: 400 });
        }
        if (!authorName || authorName.length < 2) {
            return NextResponse.json({ error: '이름은 2자 이상이어야 합니다' }, { status: 400 });
        }
        if (!content || content.length < 5) {
            return NextResponse.json({ error: '내용은 5자 이상이어야 합니다' }, { status: 400 });
        }
        if (!password || password.length < 4) {
            return NextResponse.json({ error: '비밀번호는 4자 이상이어야 합니다' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const now = new Date().toISOString();

        const comment: Comment = {
            id: uuidv4(),
            appId,
            parentId,
            authorName,
            authorRole: 'visitor', // Always force to visitor
            content,
            passwordHash: hashedPassword,
            isDeleted: false,
            createdAt: now,
        };

        await appendCommentRow(comment);

        const { passwordHash, ...publicComment } = comment;

        return NextResponse.json({ comment: publicComment }, { status: 201 });
    } catch (error) {
        console.error('Failed to create comment:', error);
        return NextResponse.json(
            { error: '댓글을 작성하는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
