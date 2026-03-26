'use client';
// app/admin/scores/ScoresSummaryClient.tsx
// 운영자 전용 전체 심사 집계 클라이언트 컴포넌트

import { useEffect, useState } from 'react';
import styles from './scores.module.css';

interface JudgeScore {
    judgeId: string;
    fieldRelevance: number;
    feasibility: number;
    outcomes: number;
    scalability: number;
    safety: number;
    deduction: number;
    bonus: number;
    total: number;
    isSubmitted: boolean;
    comment: string;
    updatedAt: string;
}

interface TeamSummary {
    teamId: string;
    teamName: string;
    org: string;
    track: string;
    judgeCount: number;
    submittedCount: number;
    avgTotal: number | null;
    avgSafety: number | null;
    avgFeasibility: number | null;
    avgScalability: number | null;
    hasDeduction: boolean;
    scores: JudgeScore[];
    // Computed client-side
    badge?: string;
    rank?: number;
}

interface GlobalStats {
    totalTeams: number;
    teamsWithAnyScore: number;
    teamsFullySubmitted: number;
    totalScoreEntries: number;
}

const COL_LABELS = ['현장적합성', '실행가능성', '성과성', '확산성', '안전성', '감점', '가산점'];
const TRACKS = ['전체', '사례관리', '행정', '홍보', '자원연계', '기타']; // You may want to fetch this dynamically if possible, but hardcoding common tracks for now based on PRD

export default function ScoresSummaryClient() {
    const [allTeams, setAllTeams] = useState<TeamSummary[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('전체');
    const [participationWinners, setParticipationWinners] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/admin/scores/summary')
            .then((r) => r.json())
            .then((data) => {
                let ts: TeamSummary[] = data.teamSummary ?? [];
                
                // 1. Group by track
                const byTrack: Record<string, TeamSummary[]> = {};
                for (const t of ts) {
                    if (!byTrack[t.track]) byTrack[t.track] = [];
                    byTrack[t.track].push(t);
                }

                const finalists = new Set<string>();

                // 2. Rank within each track & assign Finalist (Top 3)
                for (const track of Object.keys(byTrack)) {
                    byTrack[track].sort((a, b) => {
                        if (a.avgTotal === null && b.avgTotal === null) return 0;
                        if (a.avgTotal === null) return 1;
                        if (b.avgTotal === null) return -1;
                        if (a.avgTotal !== b.avgTotal) return b.avgTotal - a.avgTotal;
                        
                        // Tie-breakers
                        if (a.avgSafety !== b.avgSafety) return (b.avgSafety || 0) - (a.avgSafety || 0);
                        if (a.avgFeasibility !== b.avgFeasibility) return (b.avgFeasibility || 0) - (a.avgFeasibility || 0);
                        if (a.avgScalability !== b.avgScalability) return (b.avgScalability || 0) - (a.avgScalability || 0);
                        return 0;
                    });
                    
                    byTrack[track].forEach((team, index) => {
                        team.rank = index + 1;
                        if (index < 3 && team.avgTotal !== null) {
                            team.badge = '🏆 본선 진출';
                            finalists.add(team.teamId);
                        }
                    });
                }

                // 3. Assign Special Awards (Top 5 among non-finalists with NO deductions)
                const specialAwardCandidates = ts.filter(t => !finalists.has(t.teamId) && !t.hasDeduction && t.avgTotal !== null);
                specialAwardCandidates.sort((a, b) => {
                    if (a.avgTotal !== b.avgTotal) return (b.avgTotal || 0) - (a.avgTotal || 0);
                    if (a.avgSafety !== b.avgSafety) return (b.avgSafety || 0) - (a.avgSafety || 0);
                    if (a.avgFeasibility !== b.avgFeasibility) return (b.avgFeasibility || 0) - (a.avgFeasibility || 0);
                    if (a.avgScalability !== b.avgScalability) return (b.avgScalability || 0) - (a.avgScalability || 0);
                    return 0;
                });

                specialAwardCandidates.slice(0, 5).forEach(team => {
                    const originalTeam = ts.find(t => t.teamId === team.teamId);
                    if (originalTeam) originalTeam.badge = '🌟 특별상';
                });

                // Final sort for '전체' tab - show by track then rank
                ts.sort((a, b) => {
                    if (a.track !== b.track) return a.track.localeCompare(b.track);
                    return (a.rank || 99) - (b.rank || 99);
                });

                setAllTeams(ts);
                setGlobalStats({
                    totalTeams: ts.length,
                    teamsWithAnyScore: ts.filter((t) => t.judgeCount > 0).length,
                    teamsFullySubmitted: ts.filter((t) => t.submittedCount > 0).length,
                    totalScoreEntries: ts.reduce((s, t) => s + t.submittedCount, 0),
                });
            })
            .finally(() => setLoading(false));
    }, []);

    // CSV 내보내기
    const handleCSV = () => {
        const rows = [
            ['팀ID', '팀명', '분야', '기관', '순위/배지', '심사위원ID', '현장적합성', '실행가능성', '성과성', '확산성', '안전성', '감점', '가산점', '심사합계', '제출여부', '코멘트', '마지막수정'],
        ];
        for (const t of allTeams) {
            for (const s of t.scores) {
                rows.push([
                    t.teamId, t.teamName, t.track, t.org,
                    t.badge ? `[${t.rank}위] ${t.badge}` : `${t.rank}위`,
                    s.judgeId,
                    String(s.fieldRelevance), String(s.feasibility), String(s.outcomes),
                    String(s.scalability), String(s.safety), String(s.deduction), String(s.bonus),
                    String(s.total),
                    s.isSubmitted ? '제출' : '임시저장',
                    s.comment.replace(/,/g, ' '),
                    s.updatedAt,
                ]);
            }
        }
        const csv = rows.map((r) => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `심사결과_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const drawParticipationAwards = () => {
        // Find teams with at least 1 judge (proxy for being in 'complete' stage & having submitted something valid)
        const eligibleTeams = allTeams.filter(t => t.judgeCount > 0).map(t => t.teamId);
        if (eligibleTeams.length === 0) {
            alert('추첨 가능한 팀이 없습니다.');
            return;
        }
        
        // Shuffle array using Fisher-Yates
        for (let i = eligibleTeams.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [eligibleTeams[i], eligibleTeams[j]] = [eligibleTeams[j], eligibleTeams[i]];
        }
        
        // Take up to 40
        const winners = eligibleTeams.slice(0, 40);
        setParticipationWinners(winners);
    };

    const toggleExpand = (teamId: string) =>
        setExpanded((prev) => ({ ...prev, [teamId]: !prev[teamId] }));

    if (loading) return <div className={styles.loading}>불러오는 중…</div>;

    const displayedTeams = activeTab === '전체' ? allTeams : allTeams.filter(t => t.track === activeTab);
    const availableTracks = ['전체', ...Array.from(new Set(allTeams.map(t => t.track)))];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>📊 전체 심사 집계 (본선 진출팀)</h1>
                    <p className={styles.subtitle}>
                        admin 전용 — 점수는 외부에 공개되지 않습니다.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={styles.csvBtn} onClick={drawParticipationAwards} style={{ backgroundColor: '#10b981' }}>
                        🎁 참여상 40명 추첨
                    </button>
                    <button className={styles.csvBtn} onClick={handleCSV}>
                        📥 CSV 내보내기
                    </button>
                </div>
            </div>

            {/* 전체 통계 */}
            {globalStats && (
                <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>전체 심사대상 팀 수</div>
                        <div className={styles.summaryValue}>{globalStats.totalTeams}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>심사 참여 팀</div>
                        <div className={styles.summaryValue}>{globalStats.teamsWithAnyScore}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>제출완료 있는 팀</div>
                        <div className={styles.summaryValue}>{globalStats.teamsFullySubmitted}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>총 제출 건수</div>
                        <div className={styles.summaryValue}>{globalStats.totalScoreEntries}</div>
                    </div>
                </div>
            )}

            {/* 탭 필터 */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {availableTracks.map(track => (
                    <button 
                        key={track} 
                        onClick={() => setActiveTab(track)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '99px',
                            border: '1px solid #e5e7eb',
                            backgroundColor: activeTab === track ? '#4f46e5' : '#fff',
                            color: activeTab === track ? '#fff' : '#374151',
                            fontWeight: activeTab === track ? 'bold' : 'normal',
                            cursor: 'pointer',
                        }}
                    >
                        {track}
                    </button>
                ))}
            </div>

            {/* 팀별 테이블 */}
            <div className={styles.tableWrap}>
                <div className={styles.tableHead}>
                    <span>순위/뱃지</span>
                    <span>팀명 (부문)</span>
                    <span>기관</span>
                    <span>심사 수</span>
                    <span>제출 완료</span>
                    <span>평균 심사합계</span>
                    <span></span>
                </div>

                {displayedTeams.length === 0 ? (
                    <div className={styles.emptyMsg}>아직 해당 부문의 심사 데이터가 없습니다.</div>
                ) : (
                    displayedTeams.map((t) => (
                        <div key={t.teamId} className={styles.tableRow}>
                            <div
                                className={styles.tableRowMain}
                                onClick={() => t.judgeCount > 0 && toggleExpand(t.teamId)}
                                style={{
                                    backgroundColor: participationWinners.includes(t.teamId) ? '#fef3c7' : 'inherit'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', color: t.badge?.includes('본선') ? '#b45309' : t.badge?.includes('특별') ? '#0ea5e9' : '#6b7280' }}>
                                    {t.badge ? <span>{t.badge}</span> : <span>{t.rank}위</span>}
                                </div>
                                <div>
                                    <div className={styles.teamName}>{t.teamName}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                        {activeTab === '전체' && `[${t.track}] `}
                                        {participationWinners.includes(t.teamId) && <span style={{ color: '#d97706', fontWeight: 'bold' }}>☕ 참여상 당첨</span>}
                                    </div>
                                </div>
                                <div className={styles.teamOrg}>{t.org || '-'}</div>
                                <div className={styles.cell}>{t.judgeCount}명</div>
                                <div className={styles.cell}>{t.submittedCount}명</div>
                                <div>
                                    {t.avgTotal !== null ? (
                                        <span className={styles.avgScore}>{t.avgTotal}점</span>
                                    ) : (
                                        <span className={styles.noScore}>-</span>
                                    )}
                                </div>
                                <div className={styles.expandIcon}>
                                    {t.judgeCount > 0
                                        ? expanded[t.teamId]
                                            ? '▲'
                                            : '▼'
                                        : ''}
                                </div>
                            </div>

                            {expanded[t.teamId] && t.scores.length > 0 && (
                                <div className={styles.expandedDetail}>
                                    <div className={styles.subHeader}>
                                        <span>심사위원</span>
                                        {COL_LABELS.map((l) => (
                                            <span key={l}>{l}</span>
                                        ))}
                                        <span>심사합계</span>
                                    </div>
                                    {t.scores.map((s, idx) => (
                                        <div key={idx} className={styles.judgeScoreRow}>
                                            <span className={styles.judgeLabel}>
                                                {s.isSubmitted ? (
                                                    <span className={styles.submittedDot} />
                                                ) : (
                                                    <span className={styles.savedDot} />
                                                )}
                                                심사위원 {idx + 1}
                                            </span>
                                            <span className={styles.scoreCell}>{s.fieldRelevance}</span>
                                            <span className={styles.scoreCell}>{s.feasibility}</span>
                                            <span className={styles.scoreCell}>{s.outcomes}</span>
                                            <span className={styles.scoreCell}>{s.scalability}</span>
                                            <span className={styles.scoreCell}>{s.safety}</span>
                                            <span className={styles.scoreCell} style={{ color: s.deduction < 0 ? '#ef4444' : undefined }}>
                                                {s.deduction}
                                            </span>
                                            <span className={styles.scoreCell} style={{ color: s.bonus > 0 ? '#10b981' : undefined }}>
                                                {s.bonus > 0 ? `+${s.bonus}` : s.bonus}
                                            </span>
                                            <span className={styles.totalCell}>{s.total}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.75rem' }}>
                🟢 제출완료 &nbsp; 🟡 임시저장
            </p>
        </div>
    );
}
