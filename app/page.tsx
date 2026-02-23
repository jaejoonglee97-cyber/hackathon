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
import CountdownWidget from './components/CountdownWidget';

export const dynamic = 'force-dynamic';

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

    // 3) 데이터 로딩
    const [allTeams, allProjects, deadlines, allTeamMembers] = await Promise.all([
        listRows('teams'),
        listRows('projects'),
        getActiveDeadlines().catch(err => {
            console.warn('Failed to fetch deadlines:', err);
            return [];
        }),
        listRows('team_members'),
    ]);

    // 4) 내 팀 정보
    const teamMember = await getRowBy('team_members', 'user_id', currentUser.userId);
    const myTeamId = teamMember?.team_id;
    const myTeam = allTeams.find((t) => t.id === myTeamId);

    // 5) 부문별 접수 현황 집계
    const trackCounts: Record<string, number> = {
        '현장 업무경감 자동화': 0,
        '이용자 지원 및 접근성 개선': 0,
        '협업·지식관리·성과지표': 0,
    };
    const trackIcons: Record<string, string> = {
        '현장 업무경감 자동화': '⚙️',
        '이용자 지원 및 접근성 개선': '♿',
        '협업·지식관리·성과지표': '📊',
    };

    let uncategorized = 0;

    allProjects.forEach((project) => {
        const track = project.track?.trim();
        if (track && trackCounts[track] !== undefined) {
            trackCounts[track]++;
        } else {
            uncategorized++;
        }
    });

    const totalCount = allTeams.length;
    const now = new Date();

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* 1. 상단: 환영 & 퀵액션 */}
                <section className={styles.welcomeSection}>
                    <div className={styles.welcomeHeader}>
                        <div className={styles.welcomeText}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                <h1 className={styles.greeting} style={{ margin: 0 }}>
                                    안녕하세요, <span className={styles.userName}>{profile?.name || currentUser.name}</span>님!
                                </h1>
                                {myTeam ? (
                                    <Link href={`/teams/${myTeam.id}`} className={styles.actionButtonSecondary} style={{ padding: '0.5rem 1rem', fontSize: '0.9em' }}>
                                        🏠 내 프로젝트 바로가기
                                    </Link>
                                ) : (
                                    <Link href="/teams/new" className={styles.actionButton} style={{ padding: '0.5rem 1rem', fontSize: '0.9em' }}>
                                        🚀 프로젝트 등록하기
                                    </Link>
                                )}
                            </div>
                            <p className={styles.subGreeting}>
                                {myTeam
                                    ? `${myTeam.name} 프로젝트를 진행 중이시네요.`
                                    : '아직 참여 중인 프로젝트가 없습니다.'}
                            </p>
                        </div>

                        {/* D-Day Counter Widget */}
                        <CountdownWidget targetDate="2026-03-27T18:00:00+09:00" title="🔥 아이디어 접수 마감까지" />
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

                {/* 참여상 안내 카드 */}
                <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    border: '2px solid #f59e0b',
                    borderRadius: '1rem',
                    padding: '1.1rem 1.5rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    boxShadow: '0 2px 8px rgba(245,158,11,0.15)',
                }}>
                    <span style={{ fontSize: '2.2rem', lineHeight: 1, flexShrink: 0 }}>☕</span>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <strong style={{ fontSize: '1.05rem', color: '#92400e', display: 'block', marginBottom: '0.2rem' }}>
                            제출만 해도 커피 쿠폰! — 열매똑똑 참여상
                        </strong>
                        <span style={{ fontSize: '0.92rem', color: '#78350f', lineHeight: 1.6 }}>
                            최소 요건을 충족한 제출물을 등록하면 <strong>추첨으로 40명에게 기프티콘</strong>을 드립니다.
                            여러분의 도전을 응원합니다! 🌱
                        </span>
                    </div>
                    <a href="/guide" style={{
                        flexShrink: 0,
                        padding: '0.5rem 1rem',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        borderRadius: '0.5rem',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                    }}>
                        시상 안내 보기 →
                    </a>
                </div>

                {/* 3. 부문별 접수 현황 대시보드 */}
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        📈 실시간 접수 현황
                        <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            color: 'var(--color-text-tertiary)',
                            marginLeft: '0.5rem',
                        }}>
                            총 {totalCount}건 등록
                        </span>
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1rem',
                    }}>
                        {Object.entries(trackCounts).map(([track, count]) => (
                            <div
                                key={track}
                                style={{
                                    background: 'var(--color-surface, white)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    boxShadow: 'var(--shadow-sm)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                }}
                            >
                                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{trackIcons[track]}</span>
                                <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text-secondary)',
                                    marginTop: '0.25rem',
                                }}>
                                    {track}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                                    <span style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 800,
                                        color: 'var(--color-primary)',
                                        lineHeight: 1,
                                    }}>
                                        {count}
                                    </span>
                                    <span style={{
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        color: 'var(--color-text-tertiary)',
                                    }}>건</span>
                                </div>
                                {/* 비율 바 */}
                                <div style={{
                                    width: '100%',
                                    height: '6px',
                                    borderRadius: '3px',
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    overflow: 'hidden',
                                    marginTop: '0.3rem',
                                }}>
                                    <div style={{
                                        width: totalCount > 0 ? `${Math.round((count / totalCount) * 100)}%` : '0%',
                                        height: '100%',
                                        borderRadius: '3px',
                                        background: 'var(--gradient-primary)',
                                        transition: 'width 0.6s ease',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {uncategorized > 0 && (
                        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>
                            * 분야 미선택 프로젝트 {uncategorized}건은 위 통계에 포함되지 않았습니다.
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
}
