// 대시보드 (서버 컴포넌트) — 프로필 미완료 시 /onboarding/profile로 리다이렉트
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import {
    checkProfileComplete,
    getRowBy,
    listRows,
    getActiveDeadlines,
} from '@/lib/sheets';
import styles from './page.module.css';
import TeamGrid from './components/TeamGrid';
import type { Team } from './components/TeamCard';

export default async function DashboardPage() {
    // 1) 로그인 확인
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect('/auth/signin');
    }

    // 2) 프로필 완료 확인
    const { complete, profile } = await checkProfileComplete(currentUser.userId);
    if (!complete) {
        redirect('/onboarding/profile');
    }

    // 3) 병렬 데이터 로딩 (안전하게 처리)
    const [allTeams, allProjects, allHelps, allInsights, deadlines] = await Promise.all([
        listRows('teams'),
        listRows('projects'),
        // Optional Data: 에러 시 빈 배열 반환
        listRows('help_cards').catch(err => {
            console.warn('Failed to fetch help_cards:', err);
            return [];
        }),
        listRows('insight_cards').catch(err => {
            console.warn('Failed to fetch insight_cards:', err);
            return [];
        }),
        getActiveDeadlines().catch(err => {
            console.warn('Failed to fetch deadlines:', err);
            return [];
        }),
    ]);

    // 4) 내 팀 정보 (개인화 영역용)
    const teamMember = await getRowBy('team_members', 'user_id', currentUser.userId);
    const myTeamId = teamMember?.team_id;
    const myTeam = allTeams.find((t) => t.id === myTeamId);

    // 5) 팀 카드 데이터 가공
    const teamsData: Team[] = allTeams.map((team) => {
        const project = allProjects.find((p) => p.team_id === team.id);

        const helpCount = allHelps.filter(
            (h) => h.team_id === team.id && h.status !== 'deleted' && h.status !== 'resolved'
        ).length;

        const insightCount = allInsights.filter(
            (i) => i.team_id === team.id && i.category !== 'deleted'
        ).length;

        const recentUpdate = project?.updated_at || team.created_at;

        // 뱃지 (예시 로직)
        const badges: string[] = [];
        if (helpCount >= 3) badges.push('🌱 소통왕');
        if (insightCount >= 3) badges.push('💡 인사이트');

        return {
            id: team.id,
            name: team.name,
            org: team.org,
            stage: (team.stage as Team['stage']) || 'intro',
            recentUpdate: new Date(recentUpdate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            updatedAt: recentUpdate,
            helpCount,
            insightCount,
            badges,
        };
    });

    const now = new Date();

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* 1. 상단: 환영 & 다짐 & 퀵액션 */}
                <section className={styles.welcomeSection}>
                    <div className={styles.welcomeHeader}>
                        <div className={styles.welcomeText}>
                            <h1 className={styles.greeting}>
                                안녕하세요, <span className={styles.userName}>{profile?.name}</span>님!
                            </h1>
                            <p className={styles.subGreeting}>
                                {myTeam
                                    ? `${myTeam.name} 프로젝트를 진행 중이시네요.`
                                    : '아직 참여 중인 프로젝트가 없습니다.'}
                            </p>
                        </div>

                        <div className={styles.quickActions}>
                            {myTeam ? (
                                <Link href={`/teams/${myTeam.id}`} className={styles.actionButtonSecondary}>
                                    🏠 내 프로젝트
                                </Link>
                            ) : (
                                <Link href="/teams/new" className={styles.actionButton}>
                                    🚀 프로젝트 등록하기
                                </Link>
                            )}
                            <Link href="/help/new" className={styles.actionButtonSecondary}>
                                🆘 Help 요청
                            </Link>
                            <Link href="/insight/new" className={styles.actionButtonSecondary}>
                                ✨ Insight 등록
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 2. 공지/마감일 배너 */}
                {deadlines.length > 0 && (
                    <section className={styles.deadlineBanner}>
                        {deadlines.map((dl) => {
                            const dueDate = new Date(dl.due_at);
                            const diffMs = dueDate.getTime() - now.getTime();
                            const dDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                            const isPast = dDay < 0;
                            return (
                                <div key={dl.phase} className={`${styles.deadlineItem} ${isPast ? styles.deadlinePast : ''}`}>
                                    <span className={styles.deadlinePhase}>📢 {dl.message}</span>
                                    <span className={styles.deadlineDday}>
                                        {isPast ? `마감됨` : dDay === 0 ? '오늘 마감!' : `D-${dDay}`}
                                    </span>
                                </div>
                            );
                        })}
                    </section>
                )}

                {/* 3. 메인 콘텐츠: 팀 카드 그리드 */}
                <TeamGrid teams={teamsData} />
            </div>
        </div>
    );
}
