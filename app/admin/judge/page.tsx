// app/admin/judge/page.tsx
// 심사위원 대시보드 — 서버 컴포넌트 (권한 게이트)

import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import JudgeDashboardClient from './JudgeDashboardClient';

export const metadata = { title: '채점 대시보드 | 열매똑똑 해커톤' };

export default async function JudgeDashboardPage() {
    const user = await getCurrentUser();
    if (!user || !['admin', 'judge'].includes(user.role)) {
        notFound();
    }

    return <JudgeDashboardClient />;
}
