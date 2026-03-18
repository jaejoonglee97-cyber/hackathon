// app/admin/scores/page.tsx
// 운영자 전용 심사 집계 서버 컴포넌트 (admin only)

import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ScoresSummaryClient from './ScoresSummaryClient';

export const metadata = { title: '심사 집계 | 열매똑똑 해커톤' };

export default async function ScoresSummaryPage() {
    const user = await getCurrentUser();
    // admin만 접근 가능 (judge는 /admin/judge 대시보드로)
    if (!user || user.role !== 'admin') {
        notFound();
    }

    return <ScoresSummaryClient />;
}
