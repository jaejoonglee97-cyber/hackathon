// app/admin/judge/[teamId]/page.tsx
// 팀별 루브릭 채점 폼 서버 컴포넌트 (권한 게이트)

import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getRowBy } from '@/lib/sheets';
import ScoreFormClient from './ScoreFormClient';

export async function generateMetadata({ params }: { params: { teamId: string } }) {
    return { title: `채점 | ${params.teamId} | 열매똑똑 해커톤` };
}

export default async function ScoreFormPage({ params }: { params: { teamId: string } }) {
    // 권한 체크
    const user = await getCurrentUser();
    if (!user || !['admin', 'judge'].includes(user.role)) {
        notFound();
    }

    // 팀 정보 조회
    const team = await getRowBy('teams', 'id', params.teamId);
    if (!team) notFound();

    // 프로토타입 링크 조회
    const project = await getRowBy('projects', 'team_id', params.teamId);

    return (
        <ScoreFormClient
            teamId={params.teamId}
            teamName={team.name}
            org={team.org}
            prototypeLink={project?.prototype_link || ''}
            userRole={user.role}
        />
    );
}
