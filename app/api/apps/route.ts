import { NextResponse } from 'next/server';
import { getAllApps } from '@/lib/sheets';

export async function GET() {
    try {
        const apps = await getAllApps();
        
        return NextResponse.json(
            { apps },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                },
            }
        );
    } catch (error) {
        console.error('Failed to fetch apps:', error);
        return NextResponse.json(
            { error: '앱 목록을 불러오는 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
