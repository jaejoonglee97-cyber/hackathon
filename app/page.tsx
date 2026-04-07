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
import InfoBannerTabs from './components/InfoBannerTabs';


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
                            현장의 가능성은 더 넓어지고 나눔의 가치는 더 멀리 닿습니다.
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
                        <CountdownWidget
                            targetDate="2026-03-27T18:00:00+09:00"
                            title="🔥 아이디어 접수 마감까지"
                            period="📅 접수 기간: 3/9 00시 ~ 3/27 18시"
                        />
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

                {/* 이용가이드 + 참여상 탭 배너 */}
                <InfoBannerTabs />

                {/* 수살작 발표 안내 */}
                <section style={{
                    marginTop: '2rem',
                    marginBottom: '2.5rem',
                    background: 'linear-gradient(135deg, rgba(0,142,144,0.08) 0%, rgba(0,142,144,0.03) 100%)',
                    border: '1.5px solid var(--color-primary)',
                    borderRadius: '1.25rem',
                    padding: '2rem 2rem 1.5rem',
                    boxShadow: '0 4px 24px rgba(0,142,144,0.10)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.6rem' }}>🏆</span>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                            열매똑똑 해커톤 서류심사 결과 발표
                        </h2>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: 'var(--color-primary)',
                            color: '#fff',
                            borderRadius: '999px',
                            padding: '0.15rem 0.7rem',
                            marginLeft: '0.25rem',
                        }}>2026. 4. 7.</span>
                    </div>
                    <div style={{ paddingBottom: '1rem', marginBottom: '1.5rem', borderBottom: '1px dashed rgba(0,142,144,0.2)' }}>
                        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', marginTop: '0.25rem', lineHeight: '1.6' }}>
                            이번 해커톤에 귀중한 시간을 내어 참여해 주신 모든 분들께 진심으로 감사드립니다.<br />
                            여러분의 열정과 훌륭한 아이디어 덕분에 사회복지 현장의 더 나은 내일을 엿볼 수 있었습니다.<br />
                            심사위원단의 엄정한 평가를 거쳐 아래 팀이 본선에 진출하였습니다. 진심으로 축하드립니다! 🎉
                        </p>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600', padding: '0.5rem 0.8rem', background: 'rgba(0,142,144,0.08)', borderRadius: '0.5rem' }}>
                            <span>📢</span> 본선 진출팀 및 특별상 수상팀 대상 향후 일정은 개별적으로 안내해 드릴 예정입니다.
                        </div>
                    </div>

                    {/* 부문별 테이블 */}
                    {[
                        {
                            label: '이용자 지원 및 접근성 개선',
                            icon: '♿',
                            teams: [
                                { project: '행동지원 나침반 AI', org: '서울장애인종합복지관 김진래' },
                                { project: '당사자를 위한 개인예산제 관리 앱', org: '아름드리꿈터 최중호' },
                                { project: "노노케어 반찬 배달 및 안부확인 스마트 시스템 '똑똑(Knock-Knock) 기록지'", org: '북서울종합사회복지관 이동규' },
                            ],
                        },
                        {
                            label: '현장 업무경감 자동화',
                            icon: '⚙️',
                            teams: [
                                { project: 'Dawith 복지 허브', org: '방화2종합사회복지관 박민준' },
                                { project: '수기 취합 ZEROI 원스톱 회의록·실적 자동화 시스템', org: '서울특별시동부노인보호전문기관 서경은' },
                                { project: '사회복지시설 후원품 입출고 관리시스템', org: '성동구립 송정동노인복지관 박성목' },
                            ],
                        },
                        {
                            label: '협업·지식관리·성과지표',
                            icon: '📊',
                            teams: [
                                { project: '스마트 예산 관제센터', org: '서부장애인종합복지관 천우진' },
                                { project: '개인정보 및 인공지능 윤리 점검표', org: '반포종합사회복지관 이방미' },
                                { project: '핌스(FIMS) Familynet Instructor Management System', org: '동대문구가족센터 한미영' },
                            ],
                        },
                        {
                            label: '특별상',
                            icon: '⭐',
                            teams: [
                                { project: '복지홍보 나침반 AI', org: '서울장애인종합복지관 박재훈' },
                                { project: '공문접수 자동화 및 전자결재 시스템', org: '서대문노인종합복지관 김민경' },
                                { project: '시설물 민원 센터', org: '반포종합사회복지관 김경완' },
                                { project: '온가족 가계도 (AI기반 상담/사례관리 가계도 제작 및 분석)', org: '동대문구가족센터 이진선' },
                                { project: '함께하는 후원물품 입출고 기록과 실시간 현황 파악', org: '동백꽃노인종합복지관 이은' },
                            ],
                        },
                    ].map((section) => (
                        <div key={section.label} style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.6rem',
                                paddingBottom: '0.4rem',
                                borderBottom: '1px solid rgba(0,142,144,0.2)',
                            }}>
                                <span style={{ fontSize: '1.1rem' }}>{section.icon}</span>
                                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                    {section.label}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                {section.teams.map((team, i) => (
                                    <div key={i} style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.55rem 0.85rem',
                                        borderRadius: '0.6rem',
                                        background: 'rgba(255,255,255,0.6)',
                                        backdropFilter: 'blur(4px)',
                                    }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                            {team.project}
                                        </span>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--color-text-tertiary)',
                                            whiteSpace: 'nowrap',
                                            fontWeight: 500,
                                        }}>
                                            {team.org}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                {/* 3. 부문별 접수 현황 대시보드 */}
                <section style={{ marginBottom: '3rem', marginTop: '0.5rem' }}>
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
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginTop: '0.25rem' }}>
                                    <span style={{
                                        fontSize: '3.5rem',
                                        fontWeight: 900,
                                        color: 'var(--color-primary)',
                                        lineHeight: 1,
                                        letterSpacing: '-0.02em',
                                    }}>
                                        {count}
                                    </span>
                                    <span style={{
                                        fontSize: '0.95rem',
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
                        marginTop: '3rem',
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
