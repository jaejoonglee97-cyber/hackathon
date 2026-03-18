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
    track: string;
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

    // 기존 심사 불러오기
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
                ← 심사 목록으로
            </Link>

            {/* 저장 상태 배너 */}
            {status === 'saved' && (
                <div className={styles.savedBanner}>📝 임시저장된 심사가 있습니다. 최종 제출 전 수정 가능합니다.</div>
            )}
            {status === 'submitted' && (
                <div className={styles.submittedBanner}>✅ 최종 제출 완료. 수정 후 다시 제출할 수 있습니다.</div>
            )}

            {/* ── 2컬럼 레이아웃: 좌=프로젝트 / 우=심사 ── */}
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
                            {/* 1. 프로젝트 정보 */}
                            <div className={styles.projectSection}>
                                <h2 className={styles.projectSectionTitle}>1️⃣ 프로젝트 정보</h2>
                                <InfoField label="프로젝트명" value={teamName} />
                                <InfoField label="분야" value={p.track || '아직 선택되지 않았습니다.'} />
                            </div>

                            {/* 2. 프로젝트 목적 */}
                            <div className={styles.projectSection}>
                                <h2 className={styles.projectSectionTitle}>2️⃣ 프로젝트 목적</h2>
                                <InfoField label="목적" value={p.problemStatement || '아직 작성되지 않았습니다.'} />
                            </div>

                            {/* 3. 문제의식 (프로젝트 필요성) */}
                            <div className={styles.projectSection}>
                                <h2 className={styles.projectSectionTitle}>3️⃣ 문제의식 (프로젝트 필요성)</h2>
                                <InfoField label="1) 계획 배경" value={p.situation || '아직 작성되지 않았습니다.'} />
                                <InfoField label="2) 기존 프로젝트와의 차별성" value={p.evidence1 || '아직 작성되지 않았습니다.'} />
                                <InfoField label="3) 프로젝트의 강점" value={p.evidence2 || '아직 작성되지 않았습니다.'} />
                            </div>

                            {/* 4. 프로젝트 내용 */}
                            <div className={styles.projectSection}>
                                <h2 className={styles.projectSectionTitle}>4️⃣ 프로젝트 내용</h2>
                                <InfoField label="핵심 내용 및 기능" value={p.solution || '아직 작성되지 않았습니다.'} />
                                {p.features && <InfoField label="추가 상세 기능" value={p.features} />}
                            </div>

                            {/* 5. 프로젝트로 인한 기대효과 */}
                            <div className={styles.projectSection}>
                                <h2 className={styles.projectSectionTitle}>5️⃣ 프로젝트로 인한 기대효과</h2>
                                <InfoField label="기대효과" value={p.hypothesis1 || '아직 작성되지 않았습니다.'} />
                            </div>

                            {/* 6. 프로젝트의 활용 계획 */}
                            <div className={styles.projectSection}>
                                <h2 className={styles.projectSectionTitle}>6️⃣ 프로젝트의 활용 계획</h2>
                                <InfoField label="1) 사용 계획" value={p.experimentLog || '아직 작성되지 않았습니다.'} />
                                <InfoField label="2) 확산 전략" value={p.adoptionChecklist || '아직 작성되지 않았습니다.'} />
                            </div>

                            {/* 심사 참고용 추가 정보 (성과/안전성/AI 등) */}
                            <div className={styles.projectSection}>
                                <h2 className={styles.projectSectionTitle}>📊 심사 참고용 추가 정보</h2>
                                
                                <div className={styles.evidenceGroup}>
                                    <span className={styles.infoLabel}>📉 성과 측정</span>
                                    {p.perfProblemType && <div className={styles.infoValue}>- 문제 유형: {p.perfProblemType}</div>}
                                    {p.perfImprovement && <div className={styles.infoValue}>- 개선 정도: {p.perfImprovement}</div>}
                                    {p.perfEtcDesc && <div className={styles.infoValue}>- 설명: {p.perfEtcDesc}</div>}
                                </div>

                                <div className={styles.evidenceGroup} style={{ marginTop: '0.8rem' }}>
                                    <span className={styles.infoLabel}>🤖 AI 활용 내역</span>
                                    {p.aiTools && <div className={styles.infoValue}>- 도구: {p.aiTools}</div>}
                                    {p.aiScope && <div className={styles.infoValue}>- 범위: {p.aiScope}</div>}
                                    {p.aiVerification && <div className={styles.infoValue}>- 검증: {p.aiVerification}</div>}
                                </div>

                                <div className={styles.evidenceGroup} style={{ marginTop: '0.8rem' }}>
                                    <span className={styles.infoLabel}>🔒 안전성 체크</span>
                                    <div className={styles.safetyChecks}>
                                        <span className={p.safetyNoPii === 'TRUE' ? styles.safetyOk : styles.safetyWarn}>
                                            {p.safetyNoPii === 'TRUE' ? '✅' : '⚠️'} 개인정보 미포함
                                        </span>
                                        <span className={p.safetyAnonymous === 'TRUE' ? styles.safetyOk : styles.safetyWarn}>
                                            {p.safetyAnonymous === 'TRUE' ? '✅' : '⚠️'} 익명화
                                        </span>
                                        <span className={p.safetyRestrictedLink === 'TRUE' ? styles.safetyOk : styles.safetyWarn}>
                                            {p.safetyRestrictedLink === 'TRUE' ? '✅' : '⚠️'} 링크 제한
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyProject}>
                            아직 프로젝트가 등록되지 않았습니다.
                        </div>
                    )}
                </div>

                {/* ──────── 우측: 심사 폼 ──────── */}
                <div className={styles.rightCol}>
                    <div className={styles.stickyScore}>
                        <h2 className={styles.scoreTitle}>📋 심사표</h2>

                        {/* 심사 섹션 */}
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
                            <span className={styles.totalLabel}>심사합계</span>
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
