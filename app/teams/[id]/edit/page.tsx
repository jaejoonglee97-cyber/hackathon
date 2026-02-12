// 프로젝트 편집 페이지 (서버 컴포넌트)
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMyProject } from '@/lib/permissions';
import ProjectEditForm from './ProjectEditForm';
import styles from './edit.module.css';

async function getEditData(id: string) {
    try {
        return await getMyProject(id);
    } catch (error) {
        console.error('Error fetching edit data:', error);
        return null;
    }
}

export default async function TeamEditPage({ params }: { params: { id: string } }) {
    // 로그인 확인
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect('/auth/signin');
    }

    const data = await getEditData(params.id);

    if (!data) {
        notFound();
    }

    const { team, project, canEdit, editReason, lockType } = data;

    // Hard lock이면 편집 불가
    if (!canEdit && lockType === 'hard') {
        redirect(`/teams/${params.id}`);
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <a href={`/teams/${params.id}`} className={styles.backLink}>
                        ← 뒤로 가기
                    </a>
                    <h1 className={styles.title}>프로젝트 편집</h1>
                    <p className={styles.subtitle}>{team.name}</p>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">
                    <ProjectEditForm
                        teamId={params.id}
                        project={project}
                        initialStage={team.stage || 'intro'}
                        lockType={lockType}
                        editReason={editReason}
                    />
                </div>
            </main>
        </div>
    );
}
