// API: 로그인 (TICKET-02 — JWT 기반 + 실패 잠금 + last_login_at)
import { NextRequest, NextResponse } from 'next/server';
import { getUserAuth, updateRow } from '@/lib/sheets';
import { verifyPassword } from '@/lib/bcrypt';
import { generateToken, setAuthCookie } from '@/lib/auth';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30분

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: '이메일과 비밀번호를 입력해주세요.' },
                { status: 400 },
            );
        }

        // 1) AUTH_SHEET에서 사용자 찾기
        const user = await getUserAuth(email);

        if (!user) {
            return NextResponse.json(
                { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
                { status: 401 },
            );
        }

        // 2) 잠금 확인
        if (user.locked_until) {
            const lockedUntil = new Date(user.locked_until);
            if (lockedUntil > new Date()) {
                const minutesLeft = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
                return NextResponse.json(
                    { error: `로그인이 잠겼습니다. ${minutesLeft}분 후 다시 시도해주세요.` },
                    { status: 423 },
                );
            }
        }

        // 3) 비밀번호 검증 (해시 비교)
        const isValid = await verifyPassword(password, user.password_hash);

        if (!isValid) {
            // 실패 횟수 증가
            const failedCount = parseInt(user.failed_count || '0') + 1;
            let lockedUntil = '';

            if (failedCount >= MAX_FAILED_ATTEMPTS) {
                lockedUntil = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
            }

            await updateRow(
                'users_auth',
                'email',
                email,
                { failed_count: failedCount, locked_until: lockedUntil },
                { actorUserId: user.user_id, action: 'login_failed', meta: { attempt: failedCount } },
            );

            if (failedCount >= MAX_FAILED_ATTEMPTS) {
                return NextResponse.json(
                    { error: '로그인 실패 횟수 초과. 30분 후 다시 시도해주세요.' },
                    { status: 423 },
                );
            }

            return NextResponse.json(
                { error: `이메일 또는 비밀번호가 올바르지 않습니다. (${failedCount}/${MAX_FAILED_ATTEMPTS})` },
                { status: 401 },
            );
        }

        // 4) 로그인 성공 — 실패 횟수 초기화 + last_login_at 업데이트
        const now = new Date().toISOString();
        await updateRow(
            'users_auth',
            'email',
            email,
            { failed_count: 0, locked_until: '', last_login_at: now },
            { actorUserId: user.user_id, action: 'login_success' },
        );

        // 5) JWT 토큰 생성 + 쿠키 설정
        const token = generateToken(user.user_id, user.email, user.role, email.split('@')[0]);
        setAuthCookie(token);

        return NextResponse.json(
            {
                success: true,
                message: '로그인 되었습니다.',
                user: {
                    id: user.user_id,
                    email: user.email,
                    role: user.role?.toLowerCase()?.trim() || 'user',
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: '로그인 중 오류가 발생했습니다.' },
            { status: 500 },
        );
    }
}
