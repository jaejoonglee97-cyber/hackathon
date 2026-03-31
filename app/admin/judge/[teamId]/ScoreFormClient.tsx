'use client';
// app/admin/judge/[teamId]/ScoreFormClient.tsx
// 좌: 프로젝트 상세정보 / 우: 루브릭 채점 폼

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
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

const BONUS_ITEMS = [
    { key: 'creativity', label: '도전적 참신함 — 사회복지 현장에서 시도되지 않았던 새롭고 도전적인 접근 (+5점)' },
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
    initialScreeningMemo: string;
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
    initialScreeningMemo,
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
    const [bonusReasons, setBonusReasons] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [openCriteria, setOpenCriteria] = useState<Record<string, boolean>>({});
    const [status, setStatus] = useState<'none' | 'saved' | 'submitted'>('none');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Screening Memo State
    const [screeningMemo, setScreeningMemo] = useState(initialScreeningMemo);
    const [isSavingMemo, setIsSavingMemo] = useState(false);

    // AI Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<{
        scores: Record<string, number>;
        reasons: Record<string, string>;
    } | null>(null);

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
                setBonusReasons(s.bonus_reasons ? s.bonus_reasons.split(',').filter(Boolean) : []);
                setComment(s.comment || '');
                setStatus(s.is_submitted === 'TRUE' ? 'submitted' : 'saved');
            })
            .catch(() => null);
    }, [teamId]);

    const total =
        Object.values(scores).reduce((a, b) => a + b, 0) +
        (deductionReasons.length > 0 ? -10 : 0) +
        (bonusReasons.length > 0 ? 5 : 0);

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

    const toggleBonus = (key: string) => {
        setBonusReasons((prev) =>
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
                        bonusReasons,
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
        [teamId, scores, deductionReasons, bonusReasons, comment],
    );

    const handleSaveScreeningMemo = useCallback(async () => {
        setIsSavingMemo(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/judge/screening-memo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId, screeningMemo }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '메모 저장 실패');
            setMessage({ type: 'success', text: '1차 스크리닝 메모가 저장되었습니다.' });
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message || '스크리닝 메모 저장 중 오류가 발생했습니다.' });
        } finally {
            setIsSavingMemo(false);
        }
    }, [teamId, screeningMemo]);

    const handleAnalyzeAI = useCallback(async () => {
        setIsAnalyzing(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/judge/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId, projectData }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'AI 분석 실패');
            setAiAnalysis(data.analysis);
            setMessage({ type: 'success', text: 'AI 분석이 완료되었습니다. 제공된 초안을 참고하세요.' });
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message || 'AI 분석 중 오류가 발생했습니다. (API 키 오류일 수 있습니다.)' });
        } finally {
            setIsAnalyzing(false);
        }
    }, [teamId, projectData]);

    const p = projectData;

    // AI Data for RadarChart
    const radarData = useMemo(() => {
        if (!aiAnalysis) return [];
        return RUBRIC.map(category => ({
            category: category.label,
            AiScore: aiAnalysis.scores[category.key] || 0,
            HumanScore: scores[category.key] || 0,
            fullMark: category.max
        }));
    }, [aiAnalysis, scores]);

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

                    {/* AI 심사 보조 및 방사형 차트 영역 */}
                    {p && !isReadOnly && (
                        <div className={styles.projectSection} style={{ marginTop: '2rem', borderTop: '2px dashed #e5e7eb', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 className={styles.projectSectionTitle} style={{ margin: 0 }}>🤖 AI 심사 보조 (초안 분석)</h2>
                                <button
                                    className={styles.btnSave}
                                    style={{ background: '#6366f1', color: '#fff', border: 'none' }}
                                    disabled={isAnalyzing}
                                    onClick={handleAnalyzeAI}
                                >
                                    {isAnalyzing ? '분석 중...' : '분석 시작 (Gemini)'}
                                </button>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                                참가자가 작성한 텍스트 기반으로 루브릭 기준 5개 항목을 AI가 1차 평가합니다. <br/>
                                <strong>주의:</strong> 프로토타입의 실제 구동 및 디자인 완성도는 심사위원이 직접 확인해야 합니다.
                            </p>
                            
                            {isAnalyzing && (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#6366f1', fontWeight: 600 }}>
                                    프로젝트 데이터를 분석하고 있습니다... (약 5~10초 소요)
                                </div>
                            )}

                            {aiAnalysis && !isAnalyzing && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem' }}>
                                    
                                    {/* 방사형 차트 */}
                                    <div style={{ width: '100%', height: 300, background: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1rem' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="category" tick={{ fill: '#4b5563', fontSize: 12 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 20]} stroke="#9ca3af" />
                                                <Radar name="AI 초안 점수" dataKey="AiScore" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                                                <Tooltip />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* 항목별 이유 명시 */}
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>💡 AI 파트별 분석 코멘트</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {RUBRIC.map((item) => (
                                                <div key={item.key} style={{ fontSize: '0.875rem', background: '#fff', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
                                                    <span style={{ fontWeight: 600, color: '#6366f1' }}>{item.label} ({aiAnalysis.scores[item.key]}점): </span>
                                                    <span style={{ color: '#374151' }}>{aiAnalysis.reasons[item.key] || '분석 내용 없음'}</span>
                                                    <br/>
                                                    <button 
                                                        style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                                                        onClick={() => handleScoreChange(item.key, aiAnalysis.scores[item.key])}
                                                    >
                                                        이 점수 반영하기
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ──────── 우측: 심사 폼 ──────── */}
                <div className={styles.rightCol}>
                    <div className={styles.stickyScore}>
                        
                        {/* 🚨 1차 스크리닝 메모 (가장 상단 배치) */}
                        <div className={styles.projectSection} style={{ borderLeft: '4px solid #ef4444', background: '#fef2f2', padding: '1rem', marginBottom: '1.5rem', borderRadius: '0.375rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.125rem', color: '#b91c1c', margin: 0, fontWeight: 'bold' }}>🚨 1차 스크리닝 (사전 탈락 사유)</h2>
                                <button
                                    onClick={handleSaveScreeningMemo}
                                    disabled={isSavingMemo}
                                    style={{ padding: '0.3rem 0.8rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.875rem' }}
                                >
                                    {isSavingMemo ? '저장 중...' : '메모 저장'}
                                </button>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#991b1b', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                                프로토타입 실행 불가, 심각한 권한 문제 등 사전 탈락 사유가 있다면 여기에 적어주세요.<br/>
                                <strong style={{ color: '#7f1d1d' }}>※ 이곳에 1글자라도 작성되어 있으면 모든 심사위원의 최종 제출 버튼이 잠깁니다.</strong>
                            </p>
                            <textarea
                                value={screeningMemo}
                                onChange={(e) => setScreeningMemo(e.target.value)}
                                placeholder="탈락 사유가 없으면 비워두세요."
                                style={{ width: '100%', minHeight: '60px', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #fca5a5', marginTop: '0.5rem', resize: 'vertical' }}
                            />
                        </div>

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

                        {/* 가산점 */}
                        <div className={styles.deductSection} style={{ marginTop: '1rem', borderRightColor: '#10b981' }}>
                            <div className={styles.deductTitle} style={{ color: '#10b981' }}>
                                <span>* 가산점 항목</span>
                                <span className={styles.deductNote} style={{ color: '#059669', background: '#d1fae5' }}>+5점</span>
                            </div>
                            {BONUS_ITEMS.map((b) => (
                                <label key={b.key} className={styles.checkItem}>
                                    <input
                                        type="checkbox"
                                        checked={bonusReasons.includes(b.key)}
                                        disabled={isReadOnly}
                                        onChange={() => toggleBonus(b.key)}
                                    />
                                    <span className={styles.checkLabel}>{b.label}</span>
                                </label>
                            ))}
                            <div
                                className={`${styles.deductResult}`}
                                style={{
                                    backgroundColor: bonusReasons.length > 0 ? '#10b981' : '#f3f4f6',
                                    color: bonusReasons.length > 0 ? '#fff' : '#9ca3af',
                                }}
                            >
                                {bonusReasons.length > 0 ? '+5점 적용' : '가산점 없음'}
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
                                    disabled={saving || screeningMemo.trim().length > 0}
                                    onClick={() => handleSave(true)}
                                    title={screeningMemo.trim().length > 0 ? '사전 탈락 사유가 있어 심사할 수 없습니다.' : ''}
                                    style={{
                                        opacity: screeningMemo.trim().length > 0 ? 0.5 : 1,
                                        cursor: screeningMemo.trim().length > 0 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {saving ? '제출 중…' : (screeningMemo.trim().length > 0 ? '사전 탈락 처리됨' : '최종 제출')}
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
