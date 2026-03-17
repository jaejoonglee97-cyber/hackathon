'use client';
// app/admin/scores/ScoresSummaryClient.tsx
// 운영자 전용 전체 채점 집계 클라이언트 컴포넌트

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
    total: number;
    isSubmitted: boolean;
    comment: string;
    updatedAt: string;
}

interface TeamSummary {
    teamId: string;
    teamName: string;
    org: string;
    judgeCount: number;
    submittedCount: number;
    avgTotal: number | null;
    scores: JudgeScore[];
}

interface GlobalStats {
    totalTeams: number;
    teamsWithAnyScore: number;
    teamsFullySubmitted: number;
    totalScoreEntries: number;
}

const COL_LABELS = ['현장적합성', '실행가능성', '성과성', '확산성', '안전성', '감점'];

export default function ScoresSummaryClient() {
    const [teams, setTeams] = useState<TeamSummary[]>([]);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/scores/summary')
            .then((r) => r.json())
            .then((data) => {
                const ts: TeamSummary[] = data.teamSummary ?? [];
                setTeams(ts);
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
            ['팀ID', '팀명', '기관', '심사위원ID', '현장적합성', '실행가능성', '성과성', '확산성', '안전성', '감점', '총점', '제출여부', '코멘트', '마지막수정'],
        ];
        for (const t of teams) {
            for (const s of t.scores) {
                rows.push([
                    t.teamId, t.teamName, t.org,
                    s.judgeId,
                    String(s.fieldRelevance), String(s.feasibility), String(s.outcomes),
                    String(s.scalability), String(s.safety), String(s.deduction),
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
        a.download = `채점결과_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleExpand = (teamId: string) =>
        setExpanded((prev) => ({ ...prev, [teamId]: !prev[teamId] }));

    if (loading) return <div className={styles.loading}>불러오는 중…</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>📊 전체 채점 집계</h1>
                    <p className={styles.subtitle}>
                        admin 전용 — 점수는 외부에 공개되지 않습니다.
                    </p>
                </div>
                <button className={styles.csvBtn} onClick={handleCSV}>
                    📥 CSV 내보내기
                </button>
            </div>

            {/* 전체 통계 */}
            {globalStats && (
                <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>전체 팀 수</div>
                        <div className={styles.summaryValue}>{globalStats.totalTeams}</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>채점 참여 팀</div>
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

            {/* 팀별 테이블 */}
            <div className={styles.tableWrap}>
                <div className={styles.tableHead}>
                    <span>팀명</span>
                    <span>기관</span>
                    <span>심사 수</span>
                    <span>제출 완료</span>
                    <span>평균 총점</span>
                    <span></span>
                </div>

                {teams.length === 0 ? (
                    <div className={styles.emptyMsg}>아직 채점 데이터가 없습니다.</div>
                ) : (
                    teams.map((t) => (
                        <div key={t.teamId} className={styles.tableRow}>
                            <div
                                className={styles.tableRowMain}
                                onClick={() => t.judgeCount > 0 && toggleExpand(t.teamId)}
                            >
                                <div>
                                    <div className={styles.teamName}>{t.teamName}</div>
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
                                        <span>총점</span>
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
