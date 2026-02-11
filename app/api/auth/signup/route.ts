// API: 회원가입 — 인증 정보 + 빈 프로필 만 생성
// 팀/프로젝트는 /onboarding/profile 완료 시 생성됨
import { NextRequest, NextResponse } from 'next/server';
import { getUserAuth, appendRow } from '@/lib/sheets';
import { hashPassword } from '@/lib/bcrypt';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // 필수 입력 검증
        if (!email || !password) {
            return NextResponse.json(
                { error: '이메일과 비밀번호를 입력해주세요.' },
                { status: 400 },
            );
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: '올바른 이메일 형식이 아닙니다.' },
                { status: 400 },
            );
        }

        // 비밀번호 강도 검증 (최소 8자, 영문+숫자)
        if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            return NextResponse.json(
                { error: '비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.' },
                { status: 400 },
            );
        }

        // 중복 이메일 확인
        const existingUser = await getUserAuth(email);
        if (existingUser) {
            return NextResponse.json(
                { error: '이미 등록된 이메일입니다.' },
                { status: 409 },
            );
        }

        // 비밀번호 해시 (평문 저장 절대 금지)
        const passwordHash = await hashPassword(password);

        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        // 1) AUTH_SHEET: 인증 정보
        await appendRow(
            'users_auth',
            {
                user_id: userId,
                email,
                password_hash: passwordHash,
                role: 'participant',
                status: 'active',
                failed_count: '0',
                locked_until: '',
                last_login_at: '',
                created_at: now,
                updated_at: now,
            },
            { actorUserId: userId, action: 'create_user_auth' },
        );

        // 2) DATA_SHEET: 빈 프로필 (profile_complete = FALSE)
        await appendRow(
            'users_profile',
            {
                user_id: userId,
                name: '',
                phone: '',
                org: '',
                birthdate: '',
                consent_version: '',
                consented_at: '',
                privacy_mask_level: '',
                profile_complete: 'FALSE',
                profile_completed_at: '',
            },
            { actorUserId: userId, action: 'create_user_profile' },
        );

        // ⚠️ 팀/프로젝트는 여기서 생성하지 않음!
        // → /onboarding/profile 완료 시 생성됨 (profile_complete=TRUE 전환 시점)

        return NextResponse.json(
            {
                success: true,
                message: '회원가입이 완료되었습니다. 프로필을 작성해주세요.',
                userId,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: '회원가입 중 오류가 발생했습니다.' },
            { status: 500 },
        );
    }
}
