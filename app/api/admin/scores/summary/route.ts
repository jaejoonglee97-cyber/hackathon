// app/api/admin/scores/summary/route.ts
// 관리자 전용 — 전체 팀 × 심사위원 집계
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { listRows } from '@/lib/sheets';

export async function GET() {
    const user = await getCurrentUser();
    if (!user || !['admin', 'judge'].includes(user.role)) {
        return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // judge이면 본인 심사 통계만, admin이면 전체
    const filters: Record<string, string> = user.role === 'judge' ? { judge_id: user.userId } : {};
    const [allScores, rawTeams] = await Promise.all([
        listRows('scores', filters),
        listRows('teams'),
    ]);

    // "완성" 단계(complete)인 팀만 필터링
    const allTeams = rawTeams.filter((t) => t.stage === 'complete');
    const totalTeams = allTeams.length;

    // ── judge 본인 통계 ──────────────────────────
    const myScores = allScores.filter((s) => s.judge_id === user.userId);
    const submitted = myScores.filter((s) => s.is_submitted === 'TRUE');
    const saved = myScores.filter((s) => s.is_submitted === 'FALSE');

    function avg(scores: Record<string, string>[], col: string): number {
        const vals = scores.map((s) => parseFloat(s[col] || '0')).filter((v) => !isNaN(v));
        if (vals.length === 0) return 0;
        return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    }

    const myStats = {
        totalTeams,
        scoredCount: myScores.length,
        submittedCount: submitted.length,
        savedCount: saved.length,
        remainingCount: totalTeams - myScores.length,
        avgByCategory: {
            fieldRelevance: avg(myScores, 'field_relevance'),
            feasibility: avg(myScores, 'feasibility'),
            outcomes: avg(myScores, 'outcomes'),
            scalability: avg(myScores, 'scalability'),
            safety: avg(myScores, 'safety'),
            deduction: avg(myScores, 'deduction'),
            bonus: avg(myScores, 'bonus'),
        },
        avgTotal: avg(
            myScores.map((s) => ({
                total: String(
                    ['field_relevance', 'feasibility', 'outcomes', 'scalability', 'safety', 'deduction', 'bonus']
                        .reduce((sum, col) => sum + parseFloat(s[col] || '0'), 0),
                ),
            })),
            'total',
        ),
    };

    // ── admin 전체 집계 (admin만) ──────────────────
    let teamSummary: Record<string, any>[] | null = null;
    if (user.role === 'admin') {
        // 팀별 그룹핑
        const byTeam: Record<string, Record<string, string>[]> = {};
        for (const score of allScores) {
            if (!byTeam[score.team_id]) byTeam[score.team_id] = [];
            byTeam[score.team_id].push(score);
        }

        teamSummary = allTeams.map((team) => {
            const teamScores = byTeam[team.id] ?? [];
            const submittedScores = teamScores.filter((s) => s.is_submitted === 'TRUE');
            const calcTotal = (s: Record<string, string>) =>
                ['field_relevance', 'feasibility', 'outcomes', 'scalability', 'safety', 'deduction', 'bonus']
                    .reduce((sum, col) => sum + parseFloat(s[col] || '0'), 0);

            let avgTotal = null;
            let avgSafety = null;
            let avgFeasibility = null;
            let avgScalability = null;
            let hasDeduction = false;

            if (submittedScores.length > 0) {
                avgTotal = Math.round((submittedScores.reduce((sum, s) => sum + calcTotal(s), 0) / submittedScores.length) * 10) / 10;
                avgSafety = Math.round((submittedScores.reduce((sum, s) => sum + parseFloat(s.safety || '0'), 0) / submittedScores.length) * 10) / 10;
                avgFeasibility = Math.round((submittedScores.reduce((sum, s) => sum + parseFloat(s.feasibility || '0'), 0) / submittedScores.length) * 10) / 10;
                avgScalability = Math.round((submittedScores.reduce((sum, s) => sum + parseFloat(s.scalability || '0'), 0) / submittedScores.length) * 10) / 10;
                hasDeduction = submittedScores.some((s) => parseFloat(s.deduction || '0') < 0);
            }

            return {
                teamId: team.id,
                teamName: team.name,
                org: team.org,
                track: team.track || '미지정', // Add track reference
                judgeCount: teamScores.length,
                submittedCount: submittedScores.length,
                avgTotal,
                avgSafety,
                avgFeasibility,
                avgScalability,
                hasDeduction,
                scores: teamScores.map((s) => ({
                    judgeId: s.judge_id,
                    fieldRelevance: parseFloat(s.field_relevance || '0'),
                    feasibility: parseFloat(s.feasibility || '0'),
                    outcomes: parseFloat(s.outcomes || '0'),
                    scalability: parseFloat(s.scalability || '0'),
                    safety: parseFloat(s.safety || '0'),
                    deduction: parseFloat(s.deduction || '0'),
                    bonus: parseFloat(s.bonus || '0'),
                    total: calcTotal(s),
                    isSubmitted: s.is_submitted === 'TRUE',
                    comment: s.comment || '',
                    updatedAt: s.updated_at,
                })),
            };
        });
    }

    return NextResponse.json({ myStats, teamSummary });
}
