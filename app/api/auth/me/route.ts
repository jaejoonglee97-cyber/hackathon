// API: 현재 사용자 정보 조회 (JWT 기반)
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserProfile } from '@/lib/sheets';

export async function GET() {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: '로그인이 필요합니다.' },
                { status: 401 },
            );
        }

        // 프로필 정보 가져오기
        const profile = await getUserProfile(currentUser.userId);

        return NextResponse.json(
            {
                user: {
                    id: currentUser.userId,
                    email: currentUser.email,
                    role: currentUser.role,
                    name: profile?.name || currentUser.name,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            { error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' },
            { status: 500 },
        );
    }
}
