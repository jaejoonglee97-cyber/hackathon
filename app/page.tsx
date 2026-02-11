// 대시보드 (서버 컴포넌트) — 프로필 미완료 시 /onboarding/profile로 리다이렉트
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import {
    checkProfileComplete,
    getRowBy,
    listRows,
    getActiveDeadlines,
} from '@/lib/sheets';
import styles from './page.module.css';

export default async function DashboardPage() {
    // 1) 로그인 확인
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect('/auth/signin');
    }

    // 2) 프로필 완료 확인 — 미완료 시 onboarding으로 강제 이동 (서버 리다이렉트)
    const { complete, profile } = await checkProfileComplete(currentUser.userId);
    if (!complete) {
        redirect('/onboarding/profile');
    }

    // 3) 팀/프로젝트 정보 조회
    const teamMember = await getRowBy('team_members', 'user_id', currentUser.userId);
    const teamId = teamMember?.team_id;

    const team = teamId ? await getRowBy('teams', 'id', teamId) : null;
    const project = teamId ? await getRowBy('projects', 'team_id', teamId) : null;

    // 4) Help/Insight 카드 개수
    // 4) Help/Insight 카드 개수 (에러 시 무시하고 빈 배열 처리)
    let helpCards: any[] = [];
    let insightCards: any[] = [];
    try {
        if (teamId) {
            helpCards = (await listRows('help_cards', { team_id: teamId })).filter((r) => r.status !== 'deleted');
        }
    } catch (e) {
        console.warn('Failed to fetch help cards:', e);
    }

    try {
        if (teamId) {
            insightCards = (await listRows('insight_cards', { team_id: teamId })).filter((r) => r.category !== 'deleted');
        }
    } catch (e) {
        console.warn('Failed to fetch insight cards:', e);
    }

    // 5) 마감일 정보 (D-day 표시)
    const deadlines = await getActiveDeadlines();
    const now = new Date();

    // 프로젝트 완성도 계산
    const projectFields = project
        ? [
            'problem_statement',
            'target_audience',
            'situation',
            'evidence1',
            'hypothesis1',
            'solution',
        ]
        : [];
    const filledCount = projectFields.filter((f) => project?.[f]?.trim()).length;
    const completionRate = projectFields.length > 0
        ? Math.round((filledCount / projectFields.length) * 100)
        : 0;

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* 환영 헤더 */}
                <section className={styles.welcomeSection}>
                    <h1 className={styles.greeting}>
                        안녕하세요, <span className={styles.userName}>{profile?.name}</span>님!
                    </h1>
                    <p className={styles.orgBadge}>{profile?.org}</p>
                </section>

                {/* D-day 알림 배너 */}
                {deadlines.length > 0 && (
                    <section className={styles.deadlineBanner}>
                        {deadlines.map((dl) => {
                            const dueDate = new Date(dl.due_at);
                            const diffMs = dueDate.getTime() - now.getTime();
                            const dDay = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                            const isPast = dDay < 0;
                            return (
                                <div key={dl.phase} className={`${styles.deadlineItem} ${isPast ? styles.deadlinePast : ''}`}>
                                    <span className={styles.deadlinePhase}>{dl.message}</span>
                                    <span className={styles.deadlineDday}>
                                        {isPast
                                            ? `D+${Math.abs(dDay)} (마감됨)`
                                            : dDay === 0
                                                ? 'D-Day!'
                                                : `D-${dDay}`}
                                    </span>
                                    {dl.lock_mode === 'soft' && isPast && (
                                        <span className={styles.lockBadge}>편집 가능 · 제출 잠금</span>
                                    )}
                                    {dl.lock_mode === 'hard' && isPast && (
                                        <span className={styles.lockBadgeHard}>편집 · 제출 잠금</span>
                                    )}
                                </div>
                            );
                        })}
                    </section>
                )}

                {/* 내 프로젝트 카드 */}
                {team && project && (
                    <section className={styles.projectCard}>
                        <div className={styles.projectHeader}>
                            <h2 className={styles.projectTitle}>{team.name}</h2>
                            <span className={styles.stageBadge}>{team.stage}</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                        <p className={styles.progressText}>프로젝트 완성도 {completionRate}%</p>
                        <div className={styles.projectActions}>
                            <a href={`/teams/${teamId}`} className={styles.primaryButton}>
                                프로젝트 편집
                            </a>
                        </div>
                    </section>
                )}

                {/* Help / Insight 요약 */}
                <section className={styles.cardGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🤝</div>
                        <div className={styles.statNumber}>{helpCards.length}</div>
                        <div className={styles.statLabel}>Help 카드</div>
                        <a href="/helps" className={styles.statLink}>모두 보기 →</a>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>💡</div>
                        <div className={styles.statNumber}>{insightCards.length}</div>
                        <div className={styles.statLabel}>Insight 카드</div>
                        <a href="/insights" className={styles.statLink}>모두 보기 →</a>
                    </div>
                </section>

                {/* 빠른 시작 */}
                <section className={styles.quickStart}>
                    <h3 className={styles.quickStartTitle}>빠른 시작</h3>
                    <div className={styles.quickStartGrid}>
                        <a href="/help/new" className={styles.quickStartItem}>
                            <span className={styles.qsIcon}>🆘</span>
                            <span>Help 요청</span>
                        </a>
                        <a href="/insight/new" className={styles.quickStartItem}>
                            <span className={styles.qsIcon}>✨</span>
                            <span>Insight 등록</span>
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}
