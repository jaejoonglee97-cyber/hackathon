// API: 프로젝트 업데이트 — 프로필 게이트 포함
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { canEditProject } from '@/lib/permissions';
import { updateRow } from '@/lib/sheets';

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
