// API: 로그아웃 (JWT 기반)
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
    try {
        // JWT 쿠키 삭제
        clearAuthCookie();

        return NextResponse.json(
            {
                success: true,
                message: '로그아웃 되었습니다.',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: '로그아웃 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
