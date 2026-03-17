'use client';
// app/admin/judge/[teamId]/ScoreFormClient.tsx
// 루브릭 채점 폼 클라이언트 컴포넌트

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

interface ScoreFormClientProps {
    teamId: string;
    teamName: string;
    org: string;
    prototypeLink?: string;
    userRole: string;  // 'admin' | 'judge'
}

export default function ScoreFormClient({
    teamId,
    teamName,
    org,
    prototypeLink,
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

    return (
        <div className={styles.container}>
            <Link href="/admin/judge" className={styles.backLink}>
                ← 채점 목록으로
            </Link>

            {/* 팀 요약 */}
            <div className={styles.teamCard}>
                <div>
                    <h1 className={styles.teamTitle}>{teamName}</h1>
                    <p className={styles.teamMeta}>{org}</p>
                </div>
                {prototypeLink && (
                    <a
                        href={prototypeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.protoLink}
                    >
                        🔗 프로토타입 열기
                    </a>
                )}
            </div>

            {/* 저장 상태 배너 */}
            {status === 'saved' && (
                <div className={styles.savedBanner}>📝 임시저장된 채점이 있습니다. 최종 제출 전 수정 가능합니다.</div>
            )}
            {status === 'submitted' && (
                <div className={styles.submittedBanner}>✅ 최종 제출 완료. 수정 후 다시 제출할 수 있습니다.</div>
            )}

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
                                <span className={styles.sectionMax}>배점 {item.max}점</span>
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
                        {/* 세부 기준 아코디언 */}
                        <button
                            className={styles.criteriaToggle}
                            onClick={() =>
                                setOpenCriteria((prev) => ({
                                    ...prev,
                                    [item.key]: !prev[item.key],
                                }))
                            }
                        >
                            {isOpen ? '▲' : '▼'} 세부 심사 기준 {isOpen ? '접기' : '보기'}
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

            {/* 감점 항목 */}
            <div className={styles.deductSection}>
                <div className={styles.deductTitle}>
                    <span>* 감점 항목</span>
                    <span className={styles.deductNote}>1개 이상 해당 시 -10점</span>
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
                    {deductionReasons.length > 0 ? '-10점 적용됩니다.' : '감점 없음'}
                </div>
            </div>

            {/* 코멘트 */}
            <div className={styles.commentSection}>
                <span className={styles.commentLabel}>심사 코멘트</span>
                <span className={styles.commentNote}>비공개 — 운영자와 본인만 확인합니다.</span>
                <textarea
                    className={styles.commentTextarea}
                    placeholder="팀에 대한 전반적인 의견, 특이사항 등 자유롭게 작성해주세요."
                    value={comment}
                    disabled={isReadOnly}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            {/* 총점 표시 */}
            <div className={styles.totalRow}>
                <span className={styles.totalLabel}>총점</span>
                <span className={styles.totalScore}>{total}</span>
                <span className={styles.totalMax}>/ 100점</span>
            </div>

            {/* 액션 버튼 — judge만 표시 */}
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
    );
}
