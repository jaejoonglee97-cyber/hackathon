// API: 관리자 전용 — 비밀번호 초기화
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getUserAuth, updateRow } from '@/lib/sheets';
import { hashPassword } from '@/lib/bcrypt';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();

        // 관리자 권한 확인
        if (!['admin', 'judge'].includes(user.role)) {
            return NextResponse.json(
                { error: '관리자만 비밀번호를 초기화할 수 있습니다.' },
                { status: 403 },
            );
        }

        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: '초기화할 이메일을 입력해주세요.' },
                { status: 400 },
            );
        }

        // 사용자 존재 확인
        const targetUser = await getUserAuth(email);
        if (!targetUser) {
            return NextResponse.json(
                { error: '해당 이메일로 가입된 사용자가 없습니다.' },
                { status: 404 },
            );
        }

        // 임시 비밀번호 생성 (영문+숫자 8자리)
        const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
        let tempPassword = '';
        for (let i = 0; i < 8; i++) {
            tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // 비밀번호 해시 후 업데이트
        const passwordHash = await hashPassword(tempPassword);
        await updateRow('users_auth', 'email', email, {
            password_hash: passwordHash,
            failed_count: '0',
            locked_until: '',
            updated_at: new Date().toISOString(),
        }, {
            actorUserId: user.userId,
            action: 'admin_reset_password',
            targetId: targetUser.user_id,
            targetType: 'user_auth',
            meta: { resetBy: user.email, targetEmail: email },
        });

        return NextResponse.json({
            success: true,
            message: `${email} 비밀번호가 초기화되었습니다.`,
            tempPassword,
        });

    } catch (error: any) {
        console.error('Password reset error:', error);
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        return NextResponse.json(
            { error: '비밀번호 초기화 중 오류가 발생했습니다.' },
            { status: 500 },
        );
    }
}
