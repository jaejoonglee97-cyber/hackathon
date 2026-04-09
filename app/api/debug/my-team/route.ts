// 디버그용 — 내 팀 조회 상태 확인 (admin 전용)
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRowBy, listRows } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    }

    // 1) 현재 JWT에서 나온 userId
    const userId = currentUser.userId;

    // 2) team_members에서 exact match
    const teamMemberExact = await getRowBy('team_members', 'user_id', userId);

    // 3) team_members 전체 목록 (앞 10개만)
    const allMembers = await listRows('team_members');
    const sampleMembers = allMembers.slice(0, 10).map(m => ({
        user_id: m.user_id,
        user_id_trimmed: m.user_id?.trim(),
        team_id: m.team_id,
        matches_exact: m.user_id === userId,
        matches_trim: m.user_id?.trim() === userId.trim(),
    }));

    // 4) 내 userId와 trim 비교한 매칭
    const teamMemberTrim = allMembers.find(m => m.user_id?.trim() === userId.trim());

    return NextResponse.json({
        currentUserId: userId,
        currentUserIdLength: userId.length,
        currentUserEmail: currentUser.email,
        teamMemberExact: teamMemberExact ? {
            user_id: teamMemberExact.user_id,
            team_id: teamMemberExact.team_id,
        } : null,
        teamMemberTrim: teamMemberTrim ? {
            user_id: teamMemberTrim.user_id,
            team_id: teamMemberTrim.team_id,
        } : null,
        totalMembersInSheet: allMembers.length,
        sampleMembers,
    });
}
