// Insight 카드 작성 페이지
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getRowBy, checkProfileComplete } from '@/lib/sheets';
import InsightForm from '@/app/components/InsightForm';
import styles from './new.module.css';

export default async function NewInsightPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/auth/signin');
    }

    // 프로필 미완료 시 onboarding으로
    const { complete } = await checkProfileComplete(user.userId);
    if (!complete) {
        redirect('/onboarding/profile');
    }

    const teamMember = await getRowBy('team_members', 'user_id', user.userId);

    if (!teamMember) {
        return (
            <div className={styles.page}>
                <div className="container">
                    <div className={styles.error}>
                        <h1>오류</h1>
                        <p>팀을 찾을 수 없습니다.</p>
                        <a href="/">홈으로 돌아가기</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className="container">
                    <a href="/insights" className={styles.backLink}>
                        ← Insight 목록으로
                    </a>
                    <h1 className={styles.title}>새 Insight 작성</h1>
                    <p className={styles.subtitle}>
                        틀렸던 가정이나 새롭게 배운 점을 공유하세요
                    </p>
                </div>
            </header>

            <main className={styles.main}>
                <div className="container">
                    <InsightForm teamId={teamMember.team_id} />
                </div>
            </main>
        </div>
    );
}
