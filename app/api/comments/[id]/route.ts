import { NextResponse } from 'next/server';
import { getCommentById, softDeleteComment } from '@/lib/sheets';
import { verifyPassword } from '@/lib/bcrypt';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { password } = body;
        
        const comment = await getCommentById(id);

        if (!comment || comment.isDeleted) {
            return NextResponse.json({ error: '댓글을 찾을 수 없습니다' }, { status: 404 });
        }
        
        const user = await getCurrentUser();
        const isAdmin = user && user.role === 'admin';

        // Check password if it's a visitor comment and the user isn't an admin
        if (!isAdmin && comment.authorRole === 'visitor') {
             if (!password) {
                 return NextResponse.json({ error: '비밀번호가 필요합니다' }, { status: 400 });
             }
             
             const isValid = await verifyPassword(password, comment.passwordHash);
             if (!isValid) {
                 return NextResponse.json({ error: '비밀번호가 일치하지 않습니다' }, { status: 403 });
             }
        } else if (!isAdmin && comment.authorRole !== 'visitor') {
             return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
        }

        await softDeleteComment(id);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Failed to delete comment:', error);
        return NextResponse.json(
            { error: '댓글을 삭제하는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
