import { NextResponse } from 'next/server';
import { listRows } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [allScores, rawTeams, allProjects] = await Promise.all([
            listRows('scores'),
            listRows('teams'),
            listRows('projects'),
        ]);

        const allTeams = rawTeams.filter((t) => {
            const isComplete = t.stage === 'complete';
            const isScreenedOut = !!(t.screening_memo && String(t.screening_memo).trim().length > 0);
            return isComplete && !isScreenedOut;
        });

        const validTeamIds = new Set(allTeams.map(t => t.id));
        const validAllScores = allScores.filter(s => validTeamIds.has(s.team_id));

        return NextResponse.json({
            success: true,
            rawScoresCount: allScores.length,
            rawTeamsCount: rawTeams.length,
            rawProjectsCount: allProjects.length,
            allTeamsCountAfterFilter: allTeams.length,
            validAllScoresCount: validAllScores.length,
            sampleTeams: rawTeams.slice(0, 5).map(t => ({ id: t.id, stage: t.stage, screening_memo: t.screening_memo })),
            isCompleteSamples: rawTeams.slice(0, 5).map(t => t.stage === 'complete')
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.stack }, { status: 500 });
    }
}
