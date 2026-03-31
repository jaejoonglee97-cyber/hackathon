'use client';
// app/admin/judge/JudgeDashboardClient.tsx
// 심사위원 개인 심사 대시보드 — 클라이언트 컴포넌트

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './judge.module.css';

interface CategoryAvg {
    fieldRelevance: number;
    feasibility: number;
    outcomes: number;
    scalability: number;
    safety: number;
    deduction: number;
    bonus: number;
}

interface MyStats {
    totalTeams: number;
    scoredCount: number;
    submittedCount: number;
    savedCount: number;
    remainingCount: number;
    avgByCategory: CategoryAvg;
    avgTotal: number;
}

interface TeamScore {
    teamId: string;
    teamName: string;
    org: string;
    status: 'none' | 'saved' | 'submitted';
    total: number | null;
    isScreenedOut: boolean;
}

const CATEGORY_LABELS: { key: keyof CategoryAvg; label: string; max: number }[] = [
    { key: 'fieldRelevance', label: '현장적합성', max: 20 },
    { key: 'feasibility', label: '실행가능성', max: 20 },
    { key: 'outcomes', label: '성과성', max: 20 },
    { key: 'scalability', label: '확산성', max: 20 },
    { key: 'safety', label: '안전성(개인정보)', max: 20 },
    { key: 'deduction', label: '감점', max: 0 },
    { key: 'bonus', label: '가산점(참신함)', max: 5 },
];

export default function JudgeDashboardClient() {
    const [stats, setStats] = useState<MyStats | null>(null);
    const [teams, setTeams] = useState<TeamScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [summaryRes, teamsRes, scoresRes] = await Promise.all([
                    fetch('/api/admin/scores/summary'),
                    fetch('/api/teams'),
                    fetch('/api/admin/scores'),
                ]);
                const summaryData = await summaryRes.json();
                const teamsData = await teamsRes.json();
                const scoresData = await scoresRes.json();

                setStats(summaryData.myStats);

                // 팀별 심사 상태 합산
                const scoresByTeam: Record<string, any> = {};
                for (const s of scoresData.scores ?? []) {
                    scoresByTeam[s.team_id] = s;
                }

                const teamList: TeamScore[] = (teamsData.teams ?? [])
                    .filter((t: any) => t.stage === 'complete')
                    .map((t: any) => {
                        const s = scoresByTeam[t.id];
                        let status: 'none' | 'saved' | 'submitted' = 'none';
                        let total: number | null = null;
                        if (s) {
                            status = s.is_submitted === 'TRUE' ? 'submitted' : 'saved';
                            total =
                                parseFloat(s.field_relevance || '0') +
                                parseFloat(s.feasibility || '0') +
                                parseFloat(s.outcomes || '0') +
                                parseFloat(s.scalability || '0') +
                                parseFloat(s.safety || '0') +
                                parseFloat(s.deduction || '0') +
                                parseFloat(s.bonus || '0');
                        }
                        const isScreenedOut = !!(t.screening_memo && String(t.screening_memo).trim().length > 0);
                        return { teamId: t.id, teamName: t.name, org: t.org, status, total, isScreenedOut };
                    });

                setTeams(teamList);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return <div className={styles.loading}>불러오는 중…</div>;
    }

    const progressPct = stats
        ? Math.round((stats.submittedCount / Math.max(stats.totalTeams, 1)) * 100)
        : 0;

    const statusLabel = (s: TeamScore['status']) => {
        if (s === 'submitted') return { text: '제출완료', cls: styles.statusDone };
        if (s === 'saved') return { text: '임시저장', cls: styles.statusSaved };
        return { text: '미심사', cls: styles.statusNone };
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>📋 내 심사 현황</h1>
                <p className={styles.subtitle}>
                    언제든 들어와서 미리 심사하고 임시저장할 수 있습니다.
                </p>
            </div>

            {/* 통계 카드 */}
            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>전체 팀</span>
                        <span className={styles.statValue}>{stats.totalTeams}</span>
                        <span className={styles.statUnit}>팀</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>심사 완료</span>
                        <span className={styles.statValue}>{stats.submittedCount}</span>
                        <span className={styles.statUnit}>팀 제출</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>임시저장</span>
                        <span className={styles.statValue}>{stats.savedCount}</span>
                        <span className={styles.statUnit}>팀</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>미심사</span>
                        <span className={styles.statValue}>{stats.remainingCount}</span>
                        <span className={styles.statUnit}>팀 남음</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>내 평균 심사합계</span>
                        <span className={styles.statValue}>{stats.avgTotal || '-'}</span>
                        <span className={styles.statUnit}>점</span>
                    </div>
                </div>
            )}

            {/* 진행률 바 */}
            {stats && stats.totalTeams > 0 && (
                <div className={styles.progressSection}>
                    <div className={styles.progressLabel}>
                        <span>제출 완료 진행률</span>
                        <span>
                            {stats.submittedCount} / {stats.totalTeams} ({progressPct}%)
                        </span>
                    </div>
                    <div className={styles.progressTrack}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            )}

            {/* 항목별 평균 */}
            {stats && stats.scoredCount > 0 && (
                <div className={styles.avgSection}>
                    <p className={styles.sectionTitle}>항목별 내 평균 점수</p>
                    <div className={styles.avgGrid}>
                        {CATEGORY_LABELS.map(({ key, label, max }) => {
                            const val = stats.avgByCategory[key];
                            const isDeduction = key === 'deduction';
                            const fillPct = isDeduction
                                ? Math.abs(val) * 10
                                : max > 0
                                ? (val / max) * 100
                                : 0;
                            return (
                                <div key={key} className={styles.avgItem}>
                                    <span className={styles.avgItemLabel}>{label}</span>
                                    <div className={styles.avgBar}>
                                        <div className={styles.avgBarTrack}>
                                            <div
                                                className={`${styles.avgBarFill}${isDeduction ? ' ' + styles.deduction : ''}`}
                                                style={{ width: `${fillPct}%` }}
                                            />
                                        </div>
                                        <span className={styles.avgBarValue}>
                                            {isDeduction && val !== 0 ? val : val}
                                            {!isDeduction && `/${max}`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 팀 목록 */}
            <div className={styles.teamSection}>
                <div className={styles.tableHeader}>
                    <span>팀명</span>
                    <span>기관</span>
                    <span>상태</span>
                    <span>심사합계</span>
                    <span>심사</span>
                </div>
                {teams.length === 0 ? (
                    <div className={styles.emptyMessage}>등록된 팀이 없습니다.</div>
                ) : (
                    teams.map((t) => {
                        const { text, cls } = t.isScreenedOut 
                            ? { text: '사전 탈락', cls: styles.statusRejected } 
                            : statusLabel(t.status);
                        
                        return (
                            <div key={t.teamId} className={styles.tableRow} style={t.isScreenedOut ? { opacity: 0.6 } : {}}>
                                <div>
                                    <div className={styles.teamName} style={t.isScreenedOut ? { textDecoration: 'line-through', color: '#ef4444' } : {}}>
                                        {t.teamName}
                                    </div>
                                </div>
                                <div className={styles.orgText} style={t.isScreenedOut ? { textDecoration: 'line-through' } : {}}>{t.org || '-'}</div>
                                <div>
                                    <span className={`${styles.statusBadge} ${cls}`}>{text}</span>
                                </div>
                                <div>
                                    {t.total !== null && !t.isScreenedOut ? (
                                        <span className={styles.totalScore}>{t.total}점</span>
                                    ) : (
                                        <span className={styles.scoreEmpty}>-</span>
                                    )}
                                </div>
                                <div>
                                    <Link
                                        href={`/admin/judge/${t.teamId}`}
                                        className={`${styles.actionBtn} ${t.status !== 'none' || t.isScreenedOut ? styles.actionBtnEdit : ''}`}
                                        style={t.isScreenedOut ? { color: '#ef4444', backgroundColor: '#fee2e2' } : {}}
                                    >
                                        {t.isScreenedOut ? '사유 보기' : (t.status === 'none' ? '심사하기' : '수정하기')}
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
