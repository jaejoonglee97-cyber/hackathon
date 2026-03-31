export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { appendRow, getRowBy, listRows, updateRow } from '@/lib/sheets';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/teams — 전체 팀 목록 반환
 * judge/admin은 전체 조회, 그 외는 공개 팀 목록
 */
export async function GET() {
    try {
        const teams = await listRows('teams');
        return NextResponse.json({ teams });
    } catch (error: any) {
        console.error('Failed to list teams:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        if (!name || !name.trim()) {
            return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
        }

        // 1. Check if user already has a team
        const existingMember = await getRowBy('team_members', 'user_id', user.userId);
        if (existingMember) {
            return NextResponse.json({ error: 'User already has a team' }, { status: 400 });
        }

        const teamId = uuidv4();
        const now = new Date().toISOString();

        // 2. Create Team
        // Schema: id, name, org, member_ids, stage, created_at, updated_at
        // We get org from user profile if possible, or just leave it empty/from body?
        // Let's fetch profile to get org.
        // 2. Create Team
        const profile = await getRowBy('users_profile', 'user_id', user.userId);
        const org = profile?.org || '';

        await appendRow('teams', {
            id: teamId,
            name: name.trim(),
            org: org,
            member_ids: JSON.stringify([user.userId]),
            stage: 'intro',
            created_at: now,
            updated_at: now,
        });

        // 3. Create Team Member linkage
        const memberId = uuidv4();
        await appendRow('team_members', {
            id: memberId,
            team_id: teamId,
            user_id: user.userId,
            role: 'owner', // Creator is owner
            joined_at: now,
            updated_at: now,
        });

        // 4. Create empty Project
        await appendRow('projects', {
            team_id: teamId,
            problem_statement: '',
            target_audience: '',
            situation: '',
            evidence1: '', evidence2: '', evidence3: '',
            hypothesis1: '', hypothesis2: '',
            solution: '', features: '',
            prototype_link: '', github_link: '',
            experiment_log: '', wrong_assumption: '', next_test: '',
            adoption_checklist: '',
            updated_at: now,
        });

        return NextResponse.json({ teamId });
    } catch (error: any) {
        console.error('Failed to create team:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
