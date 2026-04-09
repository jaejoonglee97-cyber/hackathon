// 디버그용 — 내 팀 조회 상태 확인
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRowBy, listRows } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    }

    const userId = currentUser.userId;

    // 1) team_members에서 exact match
    const teamMemberExact = await getRowBy('team_members', 'user_id', userId);

    // 2) team_members 전체에서 trim 매칭
    const allMembers = await listRows('team_members');
    const teamMemberTrim = allMembers.find(m => m.user_id?.trim() === userId.trim());

    // 3) 해당 team_id로 teams 시트 직접 조회
    const foundTeamId = teamMemberExact?.team_id ?? teamMemberTrim?.team_id ?? '';
    const teamDirect = await getRowBy('teams', 'id', foundTeamId);

    // 4) teams 전체에서 trim find
    const allTeams = await listRows('teams');
    const targetId = foundTeamId.trim();
    const teamFromFind = allTeams.find(t => (t.id ?? '').trim() === targetId);
    const teamRawMatch = allTeams.find(t => t.id === foundTeamId); // trim 없이

    // 5) teams 중 해당 id 근처 값 확인 (앞뒤 공백 존재 여부)
    const teamIdSamples = allTeams.slice(0, 5).map(t => ({
        id: t.id,
        id_length: t.id?.length,
        name: t.name,
        matches_raw: t.id === foundTeamId,
        matches_trim: (t.id ?? '').trim() === targetId,
    }));

    return NextResponse.json({
        currentUserId: userId,
        currentUserEmail: currentUser.email,
        foundTeamId,
        teamMemberExact: teamMemberExact ? { user_id: teamMemberExact.user_id, team_id: teamMemberExact.team_id } : null,
        teamMemberTrim: teamMemberTrim ? { user_id: teamMemberTrim.user_id, team_id: teamMemberTrim.team_id } : null,
        teamDirect: teamDirect ? { id: teamDirect.id, name: teamDirect.name } : null,
        teamFromFind: teamFromFind ? { id: teamFromFind.id, name: teamFromFind.name } : null,
        teamRawMatch: teamRawMatch ? { id: teamRawMatch.id, name: teamRawMatch.name } : null,
        totalTeams: allTeams.length,
        teamIdSamples,
    });
}
