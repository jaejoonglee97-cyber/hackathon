// 디버그용 — scores 집계 데이터 확인 (admin 전용)
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { listRows } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: '관리자만 접근 가능합니다.' }, { status: 403 });
    }

    const [allScores, rawTeams, allProjects] = await Promise.all([
        listRows('scores'),
        listRows('teams'),
        listRows('projects'),
    ]);

    // teams 필터링
    const completeTeams = rawTeams.filter((t) => {
        const stageStr = (t.stage || '').trim();
        const isComplete = stageStr === 'complete';
        const isScreenedOut = !!(t.screening_memo && String(t.screening_memo).trim().length > 0);
        return isComplete && !isScreenedOut;
    });
    const validTeamIds = new Set(completeTeams.map(t => t.id));

    // scores 필터
    const validScores = allScores.filter(s => validTeamIds.has(s.team_id));

    // is_submitted 값 샘플
    const isSubmittedSamples = allScores.slice(0, 10).map(s => ({
        score_id: s.score_id,
        team_id: s.team_id,
        judge_id: s.judge_id,
        is_submitted_raw: s.is_submitted,
        is_submitted_length: s.is_submitted?.length,
        is_submitted_charCodes: [...(s.is_submitted || '')].map(c => c.charCodeAt(0)),
    }));

    // teams 샘플 (id, stage, screening_memo)
    const teamSamples = rawTeams.slice(0, 5).map(t => ({
        id: t.id,
        stage: t.stage,
        stage_raw_chars: [...(t.stage || '')].map(c => c.charCodeAt(0)),
        screening_memo: t.screening_memo?.slice(0, 30) || '',
        is_complete: (t.stage || '').trim() === 'complete',
    }));

    // projects track 샘플
    const projectSamples = allProjects.slice(0, 5).map(p => ({
        team_id: p.team_id,
        track: p.track,
    }));

    // team_id 매칭 확인 (scores vs validTeamIds)
    const scoreTeamIds = [...new Set(allScores.map(s => s.team_id))];
    const matchedTeamIds = scoreTeamIds.filter(id => validTeamIds.has(id));
    const unmatchedTeamIds = scoreTeamIds.filter(id => !validTeamIds.has(id));

    return NextResponse.json({
        counts: {
            rawScores: allScores.length,
            rawTeams: rawTeams.length,
            completeTeams: completeTeams.length,
            validScores: validScores.length,
            rawProjects: allProjects.length,
        },
        isSubmittedSamples,
        teamSamples,
        projectSamples,
        scoreTeamIds_count: scoreTeamIds.length,
        matchedTeamIds_count: matchedTeamIds.length,
        unmatchedTeamIds_count: unmatchedTeamIds.length,
        unmatchedTeamIds_sample: unmatchedTeamIds.slice(0, 5),
        validTeamIds_sample: [...validTeamIds].slice(0, 5),
    });
}
