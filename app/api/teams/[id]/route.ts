import { updateRow, deleteRow, listRows } from '@/lib/sheets';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { canEditProject } from '@/lib/permissions';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();

        // 프로필 완료 + 소유자 + 마감 확인 (permissions 내부에서 처리)
        const permission = await canEditProject(params.id);
        if (!permission.canEdit) {
            return NextResponse.json(
                { error: permission.reason || '편집 권한이 없습니다.' },
                { status: 403 },
            );
        }

        const body = await request.json();

        const allowedFields = [
            'problem_statement', 'target_audience', 'situation',
            'evidence1', 'evidence2', 'evidence3',
            'hypothesis1', 'hypothesis2',
            'solution', 'features',
            'prototype_link', 'github_link',
            'experiment_log', 'wrong_assumption', 'next_test',
            'adoption_checklist',
        ];

        const updates: Record<string, any> = {};
        allowedFields.forEach((field) => {
            if (field in body) updates[field] = body[field] || '';
        });

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: '업데이트할 내용이 없습니다.' }, { status: 400 });
        }

        await updateRow('projects', 'team_id', params.id, updates, {
            actorUserId: user.userId,
            action: 'update_project',
            targetId: params.id,
        });

        return NextResponse.json({
            success: true,
            message: '프로젝트가 업데이트되었습니다.',
            updatedFields: Object.keys(updates),
        });
    } catch (error: any) {
        console.error('Project update error:', error);
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
        }
        return NextResponse.json({ error: '프로젝트 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();

        // 관리자만 삭제 가능
        // (나중에 팀장도 팀 삭제 가능하게 하려면 여기서 조건 추가)
        if (!['admin', 'judge'].includes(user.role)) {
            return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        const teamId = params.id;

        // 1. Delete Team
        await deleteRow('teams', 'id', teamId, {
            actorUserId: user.userId,
            action: 'delete_team',
            targetType: 'team',
            targetId: teamId
        });

        // 2. Delete Project
        try {
            await deleteRow('projects', 'team_id', teamId, {
                actorUserId: user.userId,
                action: 'delete_project',
                targetType: 'project',
                targetId: teamId
            });
        } catch (e) {
            console.log('Project row might not exist, skipping');
        }

        // 3. Delete Team Members (This is tricky because deleteRow only deletes ONE row matching key)
        // Since deleteRow implementation uses findIndex, it deletes the first one.
        // We need to delete ALL members.
        // For now, let's list members and delete them one by one.
        const members = await listRows('team_members', { team_id: teamId });
        for (const m of members) {
            await deleteRow('team_members', 'id', m.id, {
                actorUserId: user.userId,
                action: 'delete_member',
                targetType: 'team_member',
                targetId: m.id
            });
        }

        return NextResponse.json({ success: true, message: '팀 삭제 완료' });

    } catch (error: any) {
        console.error('Project delete error:', error);
        return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
