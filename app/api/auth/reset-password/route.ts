// API: 참여자 셀프 비밀번호 초기화 — 이메일 + 이름 일치 시 새 비밀번호 설정
import { NextRequest, NextResponse } from 'next/server';
import { getUserAuth, getRowBy, updateRow } from '@/lib/sheets';
import { hashPassword } from '@/lib/bcrypt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, newPassword } = body;

        if (!email || !name?.trim() || !newPassword) {
            return NextResponse.json(
                { error: '이메일, 이름, 새 비밀번호를 모두 입력해주세요.' },
                { status: 400 },
            );
        }

        // 비밀번호 강도 검증
        if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            return NextResponse.json(
                { error: '비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.' },
                { status: 400 },
            );
        }

        // 사용자 존재 확인
        const userAuth = await getUserAuth(email);
        if (!userAuth) {
            return NextResponse.json(
                { error: '이메일 또는 이름이 일치하지 않습니다.' },
                { status: 404 },
            );
        }

        // 이름 일치 확인
        const userProfile = await getRowBy('users_profile', 'user_id', userAuth.user_id);
        if (!userProfile || userProfile.name?.trim() !== name.trim()) {
            return NextResponse.json(
                { error: '이메일 또는 이름이 일치하지 않습니다.' },
                { status: 404 },
            );
        }

        // 비밀번호 해시 후 업데이트
        const passwordHash = await hashPassword(newPassword);
        await updateRow('users_auth', 'email', email, {
            password_hash: passwordHash,
            failed_count: '0',
            locked_until: '',
            updated_at: new Date().toISOString(),
        }, {
            actorUserId: userAuth.user_id,
            action: 'self_reset_password',
            targetId: userAuth.user_id,
            targetType: 'user_auth',
        });

        return NextResponse.json({
            success: true,
            message: '비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해 주세요.',
        });

    } catch (error: any) {
        console.error('Self password reset error:', error);
        return NextResponse.json(
            { error: '비밀번호 재설정 중 오류가 발생했습니다.' },
            { status: 500 },
        );
    }
}
