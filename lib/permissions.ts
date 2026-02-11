// 권한 체크 및 마감일 + 프로필 게이트 미들웨어
import { getCurrentUser } from './auth';
import { getRowBy, getActiveDeadlines, checkProfileComplete } from './sheets';

/**
 * 프로필 완료 여부 확인 — 미완료 시 차단
 */
export async function requireProfileComplete(userId: string): Promise<{
    ok: boolean;
    reason?: string;
}> {
    const { complete } = await checkProfileComplete(userId);
    if (!complete) {
        return { ok: false, reason: '프로필을 먼저 완료해주세요.' };
    }
    return { ok: true };
}

/**
 * 프로젝트(팀) 소유자인지 확인
 */
export async function isProjectOwner(teamId: string): Promise<boolean> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return false;

        const member = await getRowBy('team_members', 'team_id', teamId);
        if (!member) return false;

        return member.user_id === currentUser.userId && member.role === 'owner';
    } catch (error) {
        console.error('Error checking project owner:', error);
        return false;
    }
}

/**
 * 프로젝트 편집 가능 여부 확인
 * 조건: 1) profile_complete=TRUE  2) hard lock 아닐 것
 */
export async function canEditProject(teamId: string): Promise<{
    canEdit: boolean;
    reason?: string;
    lockType?: 'soft' | 'hard';
}> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { canEdit: false, reason: '로그인이 필요합니다.' };
        }

        // 1) 프로필 완료 확인
        const profileGate = await requireProfileComplete(currentUser.userId);
        if (!profileGate.ok) {
            return { canEdit: false, reason: profileGate.reason };
        }

        // 2) 소유자 확인
        const isOwner = await isProjectOwner(teamId);
        if (!isOwner) {
            return { canEdit: false, reason: '권한이 없습니다.' };
        }

        // 3) config_deadlines 마감 확인
        const deadlines = await getActiveDeadlines();
        const now = new Date();

        for (const dl of deadlines) {
            const dueAt = new Date(dl.due_at);
            if (now > dueAt) {
                if (dl.lock_mode === 'hard') {
                    return {
                        canEdit: false,
                        reason: `마감(${dl.phase})이 지나 편집할 수 없습니다. ${dl.message}`,
                        lockType: 'hard',
                    };
                } else {
                    return {
                        canEdit: true,
                        reason: `마감(${dl.phase})이 지났습니다. ${dl.message}`,
                        lockType: 'soft',
                    };
                }
            }
        }

        return { canEdit: true };
    } catch (error) {
        console.error('Error checking edit permission:', error);
        return { canEdit: false, reason: '권한 확인 중 오류가 발생했습니다.' };
    }
}

/**
 * 제출 가능 여부 (soft lock 시 제출만 차단)
 */
export async function canSubmit(teamId: string): Promise<{
    canSubmit: boolean;
    reason?: string;
}> {
    const editPerm = await canEditProject(teamId);
    if (!editPerm.canEdit && editPerm.lockType === 'hard') {
        return { canSubmit: false, reason: editPerm.reason };
    }
    if (editPerm.lockType === 'soft') {
        return { canSubmit: false, reason: '마감이 지나 제출할 수 없습니다.' };
    }
    if (!editPerm.canEdit) {
        return { canSubmit: false, reason: editPerm.reason };
    }
    return { canSubmit: true };
}

/**
 * 스태프 여부 확인
 */
export async function isStaff(): Promise<boolean> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return false;
        return ['admin', 'judge', 'mentor'].includes(currentUser.role);
    } catch {
        return false;
    }
}

/**
 * Help/Insight 카드 편집 권한 확인
 */
export async function canEditCard(teamId: string): Promise<boolean> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return false;

        // 프로필 미완료 시 차단
        const { complete } = await checkProfileComplete(currentUser.userId);
        if (!complete) return false;

        if (await isStaff()) return true;
        return await isProjectOwner(teamId);
    } catch {
        return false;
    }
}

/**
 * 프로젝트 조회 (소유자 확인 포함)
 */
export async function getMyProject(teamId: string): Promise<{
    team: any;
    project: any;
    canEdit: boolean;
    editReason?: string;
    lockType?: 'soft' | 'hard';
} | null> {
    try {
        const team = await getRowBy('teams', 'id', teamId);
        if (!team) return null;

        const project = await getRowBy('projects', 'team_id', teamId);
        if (!project) return null;

        const editPermission = await canEditProject(teamId);

        return {
            team,
            project,
            canEdit: editPermission.canEdit,
            editReason: editPermission.reason,
            lockType: editPermission.lockType,
        };
    } catch (error) {
        console.error('Error getting my project:', error);
        return null;
    }
}
