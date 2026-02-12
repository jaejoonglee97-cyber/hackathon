// 팀 생성 페이지
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getRowBy, checkProfileComplete } from '@/lib/sheets';
import TeamCreateForm from '@/app/components/TeamCreateForm';
import styles from './new.module.css';

export default async function NewTeamPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/auth/signin');
    }

    // 프로필 미완료 시 onboarding으로
    const { complete, profile } = await checkProfileComplete(user.userId);
    if (!complete) {
        redirect('/onboarding/profile');
    }

    // 이미 팀이 있는지 확인
    const existingTeamMember = await getRowBy('team_members', 'user_id', user.userId);
    if (existingTeamMember) {
        redirect(`/teams/${existingTeamMember.team_id}`);
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <a href="/" className={styles.backLink}>
                        ← 홈으로 돌아가기
                    </a>
                    <h1 className={styles.title}>새 프로젝트 등록</h1>
                    <p className={styles.subtitle}>
                        {profile?.name}님, 멋진 아이디어를 세상에 보여주세요!
                    </p>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">
                    <TeamCreateForm org={profile?.org} />
                </div>
            </main>
        </div>
    );
}
