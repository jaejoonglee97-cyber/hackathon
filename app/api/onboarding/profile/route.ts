// API: 프로필 완료 (onboarding) — 프로필 저장 + 워크스페이스 생성
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
    getUserProfile,
    updateRow,
    appendRow,
    getRowBy,
    getConfigValue,
    isProfileComplete,
} from '@/lib/sheets';

/** KST(+09:00) ISO 문자열 생성 */
function nowKST(): string {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const iso = kst.toISOString().replace('Z', '+09:00');
    return iso;
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { name, phone, org, birthdate, privacyConsent, termsConsent } = body;

        // 필수 입력 검증
        if (!name || !phone || !org || !birthdate) {
            return NextResponse.json(
                { error: '이름, 휴대폰, 소속, 생년월일을 모두 입력해주세요.' },
                { status: 400 },
            );
        }

        // 생년월일 형식 검증 (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
            return NextResponse.json(
                { error: '생년월일은 YYYY-MM-DD 형식이어야 합니다. (예: 1990-01-15)' },
                { status: 400 },
            );
        }

        // 동의 체크 (개인정보 체크리스트 게이트 — PRD FR-40)
        if (!privacyConsent || !termsConsent) {
            return NextResponse.json(
                { error: '개인정보 수집 및 이용약관에 동의해주세요.' },
                { status: 400 },
            );
        }

        // 이미 프로필 완료된 사용자인지 확인
        const profile = await getUserProfile(user.userId);
        if (isProfileComplete(profile)) {
            // 이미 완료됨 → 팀 ID 찾아서 반환
            const existingTeam = await getRowBy('team_members', 'user_id', user.userId);
            const teamId = existingTeam?.team_id || null;
            if (!teamId) {
                console.warn('[onboarding] 프로필 완료 사용자이나 team_members 레코드 없음:', user.userId);
            }
            return NextResponse.json({
                success: true,
                message: '이미 프로필이 완료되었습니다.',
                teamId,
            });
        }

        const consentVersion = (await getConfigValue('consent_version')) || process.env.CONSENT_VERSION || 'v1.0';
        const kstNow = nowKST();

        // 1) 프로필 업데이트 + profile_complete=TRUE
        await updateRow(
            'users_profile',
            'user_id',
            user.userId,
            {
                name,
                phone,
                org,
                birthdate,
                consent_version: consentVersion,
                consented_at: kstNow,
                profile_complete: 'TRUE',
                profile_completed_at: kstNow,
            },
            {
                actorUserId: user.userId,
                action: 'complete_profile',
                meta: { consent_version: consentVersion },
            },
        );

        // 2) 팀/프로젝트 중복 생성 방지
        const existingMember = await getRowBy('team_members', 'user_id', user.userId);
        if (existingMember) {
            return NextResponse.json({
                success: true,
                message: '프로필이 완료되었습니다.',
                teamId: existingMember.team_id,
            });
        }

        // 3) 팀/프로젝트 자동 생성 중단 (2025-02-12 요청)
        // 사용자가 대시보드에서 직접 [프로젝트 등록하기] 버튼으로 생성함.

        return NextResponse.json(
            {
                success: true,
                message: '프로필이 저장되었습니다. 대시보드에서 새 프로젝트를 등록해주세요.',
            },
            { status: 201 },
        );
    } catch (error: any) {
        console.error('Profile onboarding error:', error);
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        return NextResponse.json(
            { error: '프로필 저장 중 오류가 발생했습니다.' },
            { status: 500 },
        );
    }
}
