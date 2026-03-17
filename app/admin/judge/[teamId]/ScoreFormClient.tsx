'use client';
// app/admin/judge/[teamId]/ScoreFormClient.tsx
// 좌: 프로젝트 상세정보 / 우: 루브릭 채점 폼

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './score-form.module.css';

interface RubricItem {
    key: string;
    label: string;
    max: number;
    criteria: string[];
}

const RUBRIC: RubricItem[] = [
    {
        key: 'fieldRelevance',
        label: '현장적합성',
        max: 20,
        criteria: [
            '현장에서 실제로 반복되는 문제인가',
            '누가/언제/어디서/어떤 흐름으로 쓰는지 구체적인가',
            '사회복지 현장 제약을 반영했는가',
        ],
    },
    {
        key: 'feasibility',
        label: '실행가능성 (프로토타입)',
        max: 20,
        criteria: [
            '실제로 동작하는 결과물이 있는가 (시연/링크로 확인 가능)',
            '핵심 흐름이 "끝까지" 되는가 (입력→저장→결과 확인/출력)',
            '사용자가 따라 해볼 수 있을 만큼 안정적/단순한가',
        ],
    },
    {
        key: 'outcomes',
        label: '성과성',
        max: 20,
        criteria: [
            '개선되었다는 말을 비교 가능한 형태로 설명하는가',
            '제출 품의 문제 유형+개선 정도와 내용이 일치하는가',
            '과장 없이 근거(짧은 설명/예시/전후 비교)가 있는가',
        ],
    },
    {
        key: 'scalability',
        label: '확산성',
        max: 20,
        criteria: [
            '다른 기관이 가져가서 따라 만들거나 바로 써볼 수 있는가',
            '설치/복제/세팅이 쉬운가 (설명/자료 포함)',
            '기관마다 달라지는 부분(항목/권한/알림 등)을 안내했는가',
        ],
    },
    {
        key: 'safety',
        label: '안전성 (개인정보)',
        max: 20,
        criteria: [
            '실제 개인정보를 쓰지 않았는가 (익명/가짜 데이터 사용)',
            '공유 권한이 안전한가 (보기/편집 분리, 내부 자료 노출 없음)',
        ],
    },
];

const DEDUCTION_ITEMS = [
    { key: 'pii', label: '실제 개인정보 포함 — 시연/제출물/링크/첨부파일에 실명·연락처·주민번호·주소·사례기록 등이 포함됨' },
    { key: 'open_edit', label: '공개 링크에 편집 권한 열림 — 링크가 있는 사람 누구나 수정/업로드/삭제 가능' },
    { key: 'internal_leak', label: '공개 링크에서 내부자료 노출 — 제출물 외 기관 내부 문서/폴더/다른 파일까지 접근 가능' },
];

interface ProjectData {
    problemStatement: string;
    targetAudience: string;
    situation: string;
    evidence1: string;
    evidence2: string;
    evidence3: string;
    hypothesis1: string;
    hypothesis2: string;
    solution: string;
    features: string;
    prototypeLink: string;
    githubLink: string;
    experimentLog: string;
    wrongAssumption: string;
    nextTest: string;
    adoptionChecklist: string;
    aiTools: string;
    aiScope: string;
    aiVerification: string;
    perfProblemType: string;
    perfImprovement: string;
    perfEtcDesc: string;
    safetyNoPii: string;
    safetyAnonymous: string;
    safetyRestrictedLink: string;
}

interface ScoreFormClientProps {
    teamId: string;
    teamName: string;
    org: string;
    stage: string;
    projectData: ProjectData | null;
    userRole: string;
}

/* ── 프로젝트 상세 카드 컴포넌트 ── */
function InfoField({ label, value }: { label: string; value: string }) {
    if (!value) return null;
    return (
        <div className={styles.infoField}>
            <span className={styles.infoLabel}>{label}</span>
            <span className={styles.infoValue}>{value}</span>
        </div>
    );
}

export default function ScoreFormClient({
    teamId,
    teamName,
    org,
    stage,
    projectData,
    userRole,
}: ScoreFormClientProps) {
    const isReadOnly = userRole === 'admin';
    const [scores, setScores] = useState<Record<string, number>>({
        fieldRelevance: 0,
        feasibility: 0,
        outcomes: 0,
        scalability: 0,
        safety: 0,
    });
    const [deductionReasons, setDeductionReasons] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [openCriteria, setOpenCriteria] = useState<Record<string, boolean>>({});
    const [status, setStatus] = useState<'none' | 'saved' | 'submitted'>('none');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // 기존 채점 불러오기
    useEffect(() => {
        fetch(`/api/admin/scores?teamId=${teamId}`)
            .then((r) => r.json())
            .then((data) => {
                const s = data.scores?.[0];
                if (!s) return;
                setScores({
                    fieldRelevance: parseFloat(s.field_relevance || '0'),
                    feasibility: parseFloat(s.feasibility || '0'),
                    outcomes: parseFloat(s.outcomes || '0'),
                    scalability: parseFloat(s.scalability || '0'),
                    safety: parseFloat(s.safety || '0'),
                });
                setDeductionReasons(s.deduction_reasons ? s.deduction_reasons.split(',').filter(Boolean) : []);
                setComment(s.comment || '');
                setStatus(s.is_submitted === 'TRUE' ? 'submitted' : 'saved');
            })
            .catch(() => null);
    }, [teamId]);

    const total =
        Object.values(scores).reduce((a, b) => a + b, 0) +
        (deductionReasons.length > 0 ? -10 : 0);

    const handleScoreChange = (key: string, val: number) => {
        const item = RUBRIC.find((r) => r.key === key);
        const clamped = Math.max(0, Math.min(item?.max ?? 20, val));
        setScores((prev) => ({ ...prev, [key]: clamped }));
    };

    const toggleDeduction = (key: string) => {
        setDeductionReasons((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
        );
    };

    const handleSave = useCallback(
        async (isSubmit: boolean) => {
            setSaving(true);
            setMessage(null);
            try {
                const res = await fetch('/api/admin/scores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        teamId,
                        ...scores,
                        deductionReasons,
                        comment,
                        isSubmitted: isSubmit,
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || '저장 실패');
                setStatus(isSubmit ? 'submitted' : 'saved');
                setMessage({ type: 'success', text: data.message });
            } catch (e: any) {
                setMessage({ type: 'error', text: e.message || '저장 중 오류가 발생했습니다.' });
            } finally {
                setSaving(false);
            }
        },
        [teamId, scores, deductionReasons, comment],
    );

    const p = projectData;

    return (
        <div className={styles.pageContainer}>
            <Link href="/admin/judge" className={styles.backLink}>
                ← 채점 목록으로
            </Link>

            {/* 저장 상태 배너 */}
            {status === 'saved' && (
                <div className={styles.savedBanner}>📝 임시저장된 채점이 있습니다. 최종 제출 전 수정 가능합니다.</div>
            )}
            {status === 'submitted' && (
                <div className={styles.submittedBanner}>✅ 최종 제출 완료. 수정 후 다시 제출할 수 있습니다.</div>
            )}

            {/* ── 2컬럼 레이아웃: 좌=프로젝트 / 우=채점 ── */}
            <div className={styles.twoCol}>
                {/* ──────── 좌측: 프로젝트 상세 ──────── */}
                <div className={styles.leftCol}>
                    {/* 팀 헤더 */}
                    <div className={styles.teamCard}>
                        <h1 className={styles.teamTitle}>{teamName}</h1>
                        <p className={styles.teamMeta}>{org}{stage ? ` · ${stage}` : ''}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            {p?.prototypeLink && (
                                <a href={p.prototypeLink} target="_blank" rel="noopener noreferrer" className={styles.protoLink}>
                                    🔗 프로토타입
                                </a>
                            )}
                            {p?.githubLink && (
                                <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className={styles.protoLink}>
                                    💻 GitHub
                                </a>
                            )}
                        </div>
                    </div>

                    {p ? (
                        <>
                            {/* Why — 문제/고객 */}
                            <div className={styles.projectSection}>
                                <h2 className={styles.projectSectionTitle}>🎯 Why — 문제/고객</h2>
                                <InfoField label="대상(누구)" value={p.targetAudience} />
                                <InfoField label="상황(언제)" value={p.situation} />
                                <InfoField label="문제(무엇)" value={p.problemStatement} />
                                <div className={styles.evidenceGroup}>
                                    <span className={styles.infoLabel}>증거</span>
                                    {p.evidence1 && <div className={styles.evidenceItem}>1. {p.evidence1}</div>}
                                    {p.evidence2 && <div className={styles.evidenceItem}>2. {p.evidence2}</div>}
                                    {p.evidence3 && <div className={styles.evidenceItem}>3. {p.evidence3}</div>}
                                </div>
                            </div>

                            {/* 가설 */}
                            <div className={styles.projectSection}>
                                <h2 className={styles.projectSectionTitle}>💡 가설</h2>
                                <InfoField label="가설 1" value={p.hypothesis1} />
                                <InfoField label="가설 2" value={p.hypothesis2} />
                            </div>

                            {/* 솔루션 */}
                            <div className={styles.projectSection}>
                                <h2 className={styles.projectSectionTitle}>🔧 솔루션</h2>
                                <InfoField label="해결 방안" value={p.solution} />
                                <InfoField label="핵심 기능" value={p.features} />
                            </div>

                            {/* 검증 로그 */}
                            {(p.experimentLog || p.wrongAssumption || p.nextTest) && (
                                <div className={styles.projectSection}>
                                    <h2 className={styles.projectSectionTitle}>🧪 검증 로그</h2>
                                    <InfoField label="실험 기록" value={p.experimentLog} />
                                    <InfoField label="틀렸던 가정" value={p.wrongAssumption} />
                                    <InfoField label="다음 검증" value={p.nextTest} />
                                </div>
                            )}

                            {/* 성과 측정 */}
                            {(p.perfProblemType || p.perfImprovement) && (
                                <div className={styles.projectSection}>
                                    <h2 className={styles.projectSectionTitle}>📈 성과 측정</h2>
                                    <InfoField label="문제 유형" value={p.perfProblemType} />
                                    <InfoField label="개선 정도" value={p.perfImprovement} />
                                    {p.perfEtcDesc && <InfoField label="기타" value={p.perfEtcDesc} />}
                                </div>
                            )}

                            {/* 확산 */}
                            {p.adoptionChecklist && (
                                <div className={styles.projectSection}>
                                    <h2 className={styles.projectSectionTitle}>🌍 확산/운영</h2>
                                    <InfoField label="재사용 체크리스트" value={p.adoptionChecklist} />
                                </div>
                            )}

                            {/* 안전성 */}
                            <div className={styles.projectSection}>
                                <h2 className={styles.projectSectionTitle}>🔒 안전성 체크</h2>
                                <div className={styles.safetyChecks}>
                                    <span className={p.safetyNoPii === 'TRUE' ? styles.safetyOk : styles.safetyWarn}>
                                        {p.safetyNoPii === 'TRUE' ? '✅' : '⚠️'} 개인정보 미포함
                                    </span>
                                    <span className={p.safetyAnonymous === 'TRUE' ? styles.safetyOk : styles.safetyWarn}>
                                        {p.safetyAnonymous === 'TRUE' ? '✅' : '⚠️'} 익명화
                                    </span>
                                    <span className={p.safetyRestrictedLink === 'TRUE' ? styles.safetyOk : styles.safetyWarn}>
                                        {p.safetyRestrictedLink === 'TRUE' ? '✅' : '⚠️'} 링크 접근 제한
                                    </span>
                                </div>
                            </div>

                            {/* AI 활용 */}
                            {(p.aiTools || p.aiScope) && (
                                <div className={styles.projectSection}>
                                    <h2 className={styles.projectSectionTitle}>🤖 AI 활용</h2>
                                    <InfoField label="사용 도구" value={p.aiTools} />
                                    <InfoField label="사용 범위" value={p.aiScope} />
                                    <InfoField label="결과 확인" value={p.aiVerification} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.emptyProject}>
                            아직 프로젝트가 등록되지 않았습니다.
                        </div>
                    )}
                </div>

                {/* ──────── 우측: 채점 폼 ──────── */}
                <div className={styles.rightCol}>
                    <div className={styles.stickyScore}>
                        <h2 className={styles.scoreTitle}>📋 채점표</h2>

                        {/* 채점 섹션 */}
                        {RUBRIC.map((item) => {
                            const val = scores[item.key] ?? 0;
                            const pct = (val / item.max) * 100;
                            const isOpen = openCriteria[item.key];
                            return (
                                <div className={styles.section} key={item.key}>
                                    <div className={styles.sectionHeader}>
                                        <div className={styles.sectionTitleRow}>
                                            <span className={styles.sectionName}>{item.label}</span>
                                            <span className={styles.sectionMax}>{item.max}점</span>
                                        </div>
                                        <div className={styles.scoreInputRow}>
                                            <input
                                                type="range"
                                                min={0}
                                                max={item.max}
                                                step={1}
                                                value={val}
                                                className={styles.slider}
                                                style={{ '--val': `${pct}%` } as any}
                                                disabled={isReadOnly}
                                                onChange={(e) =>
                                                    handleScoreChange(item.key, parseInt(e.target.value))
                                                }
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                max={item.max}
                                                value={val}
                                                className={styles.scoreInput}
                                                disabled={isReadOnly}
                                                onChange={(e) =>
                                                    handleScoreChange(item.key, parseInt(e.target.value) || 0)
                                                }
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className={styles.criteriaToggle}
                                        onClick={() =>
                                            setOpenCriteria((prev) => ({
                                                ...prev,
                                                [item.key]: !prev[item.key],
                                            }))
                                        }
                                    >
                                        {isOpen ? '▲' : '▼'} 기준 {isOpen ? '접기' : '보기'}
                                    </button>
                                    {isOpen && (
                                        <div className={styles.criteriaContent}>
                                            <ul className={styles.criteriaList}>
                                                {item.criteria.map((c, i) => (
                                                    <li key={i}>{c}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* 감점 */}
                        <div className={styles.deductSection}>
                            <div className={styles.deductTitle}>
                                <span>* 감점 항목</span>
                                <span className={styles.deductNote}>1개 이상 → -10점</span>
                            </div>
                            {DEDUCTION_ITEMS.map((d) => (
                                <label key={d.key} className={styles.checkItem}>
                                    <input
                                        type="checkbox"
                                        checked={deductionReasons.includes(d.key)}
                                        disabled={isReadOnly}
                                        onChange={() => toggleDeduction(d.key)}
                                    />
                                    <span className={styles.checkLabel}>{d.label}</span>
                                </label>
                            ))}
                            <div
                                className={`${styles.deductResult} ${
                                    deductionReasons.length > 0 ? styles.deductActive : styles.deductInactive
                                }`}
                            >
                                {deductionReasons.length > 0 ? '-10점 적용' : '감점 없음'}
                            </div>
                        </div>

                        {/* 코멘트 */}
                        <div className={styles.commentSection}>
                            <span className={styles.commentLabel}>심사 코멘트</span>
                            <textarea
                                className={styles.commentTextarea}
                                placeholder="팀에 대한 의견을 자유롭게 작성해주세요."
                                value={comment}
                                disabled={isReadOnly}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        {/* 총점 */}
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>총점</span>
                            <span className={styles.totalScore}>{total}</span>
                            <span className={styles.totalMax}>/ 100점</span>
                        </div>

                        {/* 버튼 — judge만 */}
                        {!isReadOnly && (
                            <div className={styles.actionRow}>
                                <button
                                    className={styles.btnSave}
                                    disabled={saving}
                                    onClick={() => handleSave(false)}
                                >
                                    {saving ? '저장 중…' : '임시저장'}
                                </button>
                                <button
                                    className={styles.btnSubmit}
                                    disabled={saving}
                                    onClick={() => handleSave(true)}
                                >
                                    {saving ? '제출 중…' : '최종 제출'}
                                </button>
                            </div>
                        )}

                        {message && (
                            <div className={message.type === 'success' ? styles.successMsg : styles.errorMsg}>
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
