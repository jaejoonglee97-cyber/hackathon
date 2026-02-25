// 대시보드 (서버 컴포넌트) — 비로그인도 접근 가능, 로그인 시 개인 영역 표시
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
import TeamGrid from './components/TeamGrid';
import type { Team } from './components/TeamCard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    // 1) 로그인 여부 확인 (비로그인도 허용)
    const currentUser = await getCurrentUser();

    // 2) 로그인 상태라면 프로필 정보 가져오기
    let profile: any = null;
    let myTeam: any = null;
    const isAdmin = currentUser && ['admin', 'judge'].includes(currentUser.role);

    if (currentUser) {
        const profileResult = await checkProfileComplete(currentUser.userId);
        profile = profileResult.profile;

        const teamsForUser = await listRows('teams');
        const teamMember = await getRowBy('team_members', 'user_id', currentUser.userId);
        if (teamMember?.team_id) {
            myTeam = teamsForUser.find((t) => t.id === teamMember.team_id);
        }
    }

    // 3) 통계용 데이터 (모든 방문자에게 보여줄 부문별 접수 현황)
    const [allTeams, allProjects, deadlines, allTeamMembers, allProfiles] = await Promise.all([
        listRows('teams'),
        listRows('projects'),
        getActiveDeadlines().catch(err => {
            console.warn('Failed to fetch deadlines:', err);
            return [];
        }),
        isAdmin ? listRows('team_members') : Promise.resolve([]),
        isAdmin ? listRows('users_profile') : Promise.resolve([]),
    ]);

    // 관리자용 팀 카드 데이터
    let teamsData: Team[] = [];
    if (isAdmin) {
        teamsData = allTeams.map((team) => {
            const project = allProjects.find((p) => p.team_id === team.id);
            const members = allTeamMembers.filter((m: any) => m.team_id === team.id);
            const leader = members.find((m: any) => m.role === 'leader') || members[0];
            const leaderProfile = allProfiles.find((p: any) => p.user_id === leader?.user_id);
            return {
                id: team.id,
                name: team.name,
                org: team.org,
                track: project?.track || '',
                participantType: leaderProfile?.participant_type,
                stage: (team.stage as Team['stage']) || 'intro',
                recentUpdate: new Date(team.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
                createdAt: team.created_at,
                updatedAt: project?.updated_at || team.created_at,
                helpCount: 0,
                insightCount: 0,
                badges: [],
            };
        });
    }

    // 4) 부문별 접수 현황 집계
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

    // 단계별 현황 집계
    const stageCounts: Record<string, number> = {
        'intro': 0,
        'validate': 0,
        'complete': 0,
    };
    const stageLabels: Record<string, string> = {
        'intro': '1단계(도입)',
        'validate': '2단계(검증)',
        'complete': '3단계(완성)',
    };
    const stageIcons: Record<string, string> = {
        'intro': '💡',
        'validate': '🔬',
        'complete': '🏆',
    };

    allProjects.forEach((project) => {
        const track = project.track?.trim();
        if (track && trackCounts[track] !== undefined) {
            trackCounts[track]++;
        } else {
            uncategorized++;
        }
    });

    allTeams.forEach((team) => {
        const s = team.stage?.trim() || 'intro';
        if (stageCounts[s] !== undefined) {
            stageCounts[s]++;
        }
    });

    const totalCount = allTeams.length;
    const now = new Date();

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* 1. 상단: 프리미엄 Hero 영역 (스마트워크 & DX 컨셉) */}
                <section className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>
                            열매똑똑 스마트워크와 서울 사회복지사가 함께 만드는<br />
                            <strong>사회복지 현장의 디지털 전환, 열매똑똑 해커톤</strong>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            기술은 도구일 뿐입니다. 사회복지사의 진심 어린 아이디어가 AI와 만날 때,<br />
                            우리 현장의 고질적인 문제는 해결되고 나눔의 가치는 더욱 넓게 확산됩니다.
                        </p>

                        <div className={styles.heroActions}>
                            {currentUser ? (
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {myTeam ? (
                                        <Link href={`/teams/${myTeam.id}`} className={styles.heroPrimaryButton}>
                                            🏠 내 프로젝트 대시보드
                                        </Link>
                                    ) : (
                                        <Link href="/teams/new" className={styles.heroPrimaryButton}>
                                            🚀 프로젝트 등록하기
                                        </Link>
                                    )}
                                    <div className={styles.heroWelcomeBadge}>
                                        <span className={styles.userName}>{profile?.name || currentUser.name}</span>님, 환영합니다!
                                    </div>
                                </div>
                            ) : (
                                <Link href="/auth/signin" className={styles.heroPrimaryButton}>
                                    지금 도전하기 (로그인)
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* D-Day Counter Widget - Hero 섹션 내부 또는 바로 아래 배치 */}
                    <div className={styles.heroWidgetWrapper}>
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

                {/* 이용가이드 안내 배너 */}
                <div style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '2px solid #60a5fa',
                    borderRadius: '1rem',
                    padding: '1.1rem 1.5rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    boxShadow: '0 2px 8px rgba(96,165,250,0.15)',
                }}>
                    <span style={{ fontSize: '2.2rem', lineHeight: 1, flexShrink: 0 }}>📖</span>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <strong style={{ fontSize: '1.05rem', color: '#1e40af', display: 'block', marginBottom: '0.2rem' }}>
                            참여 전, 이용가이드를 꼭 확인해 주세요!
                        </strong>
                        <span style={{ fontSize: '0.92rem', color: '#1e3a5f', lineHeight: 1.6 }}>
                            접수 방법, 심사 기준, 시상 안내 등 중요한 정보가 정리되어 있습니다.
                        </span>
                    </div>
                    <a href="/guide" style={{
                        flexShrink: 0,
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '0.5rem',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                    }}>
                        이용가이드 보기 →
                    </a>
                </div>

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

                    <div className={styles.trackGrid}>
                        {Object.entries(trackCounts).map(([track, count]) => (
                            <div
                                key={track}
                                className={styles.trackCard}
                            >
                                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{trackIcons[track]}</span>
                                <span className={styles.trackName}>
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

                    {/* 단계별 진행 현황 */}
                    <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        marginTop: '2rem',
                        marginBottom: '0.75rem',
                    }}>
                        🚦 단계별 진행 현황
                    </h3>
                    <div className={styles.stageGrid}>
                        {Object.entries(stageCounts).map(([key, count]) => (
                            <div
                                key={key}
                                className={styles.stageCard}
                            >
                                <span style={{ fontSize: '1.5rem' }}>{stageIcons[key]}</span>
                                <p className={styles.stageLabel}>
                                    {stageLabels[key]}
                                </p>
                                <span style={{
                                    fontSize: '1.8rem',
                                    fontWeight: 800,
                                    color: 'var(--color-primary)',
                                    lineHeight: 1,
                                }}>
                                    {count}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', marginLeft: '2px' }}>건</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 관리자용: 전체 프로젝트 카드 목록 */}
                {isAdmin && teamsData.length > 0 && (
                    <section style={{ marginTop: '2rem' }}>
                        <h2 style={{
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}>
                            🔒 관리자 전용 — 전체 프로젝트
                            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
                                ({teamsData.length}건)
                            </span>
                        </h2>
                        <TeamGrid teams={teamsData} />
                    </section>
                )}
            </div>
        </div>
    );
}
