// app/admin/judge/[teamId]/page.tsx
// 팀별 루브릭 심사 폼 서버 컴포넌트 (권한 게이트)

import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getRowBy } from '@/lib/sheets';
import ScoreFormClient from './ScoreFormClient';

export async function generateMetadata({ params }: { params: { teamId: string } }) {
    const team = await getRowBy('teams', 'id', params.teamId);
    return { title: `심사 | ${team?.name || params.teamId} | 열매똑똑 해커톤` };
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

    // 프로젝트 상세 조회
    const project = await getRowBy('projects', 'team_id', params.teamId);

    // 프로젝트 데이터를 직렬화 가능 형태로 정리
    const projectData = project ? {
        track: project.track || '',
        problemStatement: project.problem_statement || '',
        targetAudience: project.target_audience || '',
        situation: project.situation || '',
        evidence1: project.evidence1 || '',
        evidence2: project.evidence2 || '',
        evidence3: project.evidence3 || '',
        hypothesis1: project.hypothesis1 || '',
        hypothesis2: project.hypothesis2 || '',
        solution: project.solution || '',
        features: project.features || '',
        prototypeLink: project.prototype_link || '',
        githubLink: project.github_link || '',
        experimentLog: project.experiment_log || '',
        wrongAssumption: project.wrong_assumption || '',
        nextTest: project.next_test || '',
        adoptionChecklist: project.adoption_checklist || '',
        aiTools: project.ai_tools || '',
        aiScope: project.ai_scope || '',
        aiVerification: project.ai_verification || '',
        perfProblemType: project.perf_problem_type || '',
        perfImprovement: project.perf_improvement || '',
        perfEtcDesc: project.perf_etc_desc || '',
        safetyNoPii: project.safety_no_pii || '',
        safetyAnonymous: project.safety_anonymous || '',
        safetyRestrictedLink: project.safety_restricted_link || '',
    } : null;

    return (
        <ScoreFormClient
            teamId={params.teamId}
            teamName={team.name}
            org={team.org}
            stage={team.stage || ''}
            projectData={projectData}
            userRole={user.role}
        />
    );
}
