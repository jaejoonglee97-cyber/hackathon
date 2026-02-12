// 프로젝트 편집 폼 (클라이언트 컴포넌트)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './edit-form.module.css';

interface ProjectEditFormProps {
    teamId: string;
    project: any;
    teamName?: string;
    nameEditCount?: number;
    initialStage?: string;
    lockType?: 'soft' | 'hard';
    editReason?: string;
}

export default function ProjectEditForm({
    teamId,
    project,
    teamName = '',
    nameEditCount = 0,
    initialStage = 'intro',
    lockType,
    editReason,
}: ProjectEditFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [stage, setStage] = useState(initialStage);

    // Project Name State
    const [name, setName] = useState(teamName);
    const MAX_NAME_EDITS = 3;
    const remainingEdits = Math.max(0, MAX_NAME_EDITS - nameEditCount);
    // Only allow editing if remainingEdits > 0 or if the name hasn't changed from initial (so they can fix it before first save if we count save as edit? No, we count successful server update as edit). 
    // Actually, logic is: user can change text input. Server checks count. 
    // Here we just show the UI limit.

    const [formData, setFormData] = useState({
        // Why
        problem_statement: project?.problem_statement || '',
        target_audience: project?.target_audience || '',
        situation: project?.situation || '',
        evidence1: project?.evidence1 || '',
        evidence2: project?.evidence2 || '',
        evidence3: project?.evidence3 || '',

        // 가설
        hypothesis1: project?.hypothesis1 || '',
        hypothesis2: project?.hypothesis2 || '',

        // 해결
        solution: project?.solution || '',
        features: project?.features || '',

        // 프로토타입
        prototype_link: project?.prototype_link || '',
        github_link: project?.github_link || '',

        // 검증
        experiment_log: project?.experiment_log || '',
        wrong_assumption: project?.wrong_assumption || '',
        next_test: project?.next_test || '',

        // 확산
        adoption_checklist: project?.adoption_checklist || '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStage(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        // Check if name changed
        const nameChanged = name.trim() !== teamName;
        if (nameChanged && remainingEdits <= 0) {
            setError('프로젝트 이름 변경 횟수를 초과했습니다. (최대 3회)');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/teams/${teamId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, stage, name: name.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '업데이트에 실패했습니다.');
            }

            setSuccess(true);

            // 2초 후 상세 페이지로 이동
            setTimeout(() => {
                router.push(`/teams/${teamId}`);
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* 마감일 경고 */}
            {lockType === 'soft' && editReason && (
                <div className={styles.warningBanner}>
                    ⚠️ {editReason}
                </div>
            )}

            {error && <div className={styles.errorBanner}>{error}</div>}
            {success && (
                <div className={styles.successBanner}>
                    ✅ 저장되었습니다! 잠시 후 상세 페이지로 이동합니다...
                </div>
            )}

            {/* 프로젝트 이름 수정 */}
            <section className={styles.section} style={{ border: '2px solid #5b21b6', backgroundColor: '#f5f3ff' }}>
                <h2 className={styles.sectionTitle} style={{ color: '#4c1d95' }}>
                    <span className={styles.sectionIcon}>🏷️</span>
                    프로젝트 이름
                </h2>
                <div className={styles.field}>
                    <label htmlFor="teamName" className={styles.label}>
                        프로젝트(팀) 이름
                        <span style={{ marginLeft: '10px', fontSize: '0.9em', color: remainingEdits > 0 ? '#10b981' : '#ef4444' }}>
                            (남은 변경 횟수: {remainingEdits}회 / 총 3회)
                        </span>
                    </label>
                    <input
                        type="text"
                        id="teamName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.input}
                        placeholder="멋진 프로젝트 이름을 지어주세요"
                        disabled={remainingEdits <= 0 && name.trim() === teamName}
                        style={{ fontWeight: 'bold' }}
                    />
                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                        * 프로젝트 이름은 신중하게 결정해주세요. 최대 3회까지만 변경 가능합니다.
                    </p>
                </div>
            </section>

            {/* 진행 단계 선택 */}
            <section className={styles.section} style={{ border: '2px solid #2563eb', backgroundColor: '#eff6ff' }}>
                <h2 className={styles.sectionTitle} style={{ color: '#1e40af' }}>
                    <span className={styles.sectionIcon}>🚩</span>
                    현재 진행 단계 (직접 변경 가능)
                </h2>
                <div className={styles.field}>
                    <label htmlFor="stage" className={styles.label}>
                        우리 팀은 지금 어느 단계인가요?
                    </label>
                    <select
                        id="stage"
                        name="stage"
                        value={stage}
                        onChange={handleStageChange}
                        className={styles.input}
                        style={{ fontWeight: 'bold', color: '#1e3a8a' }}
                    >
                        <option value="intro">1단계: 기획/도입 (문제 정의 및 아이디어)</option>
                        <option value="validate">2단계: 구체화/검증 (프로토타입 및 가설 검증)</option>
                        <option value="complete">3단계: 완성/제출 (최종 결과물 및 확산 계획)</option>
                    </select>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                        * 단계에 따라 메인 화면에서의 표시 방식이 달라집니다.
                    </p>
                </div>
            </section>

            {/* Why 섹션 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>🎯</span>
                    어떤 문제를 해결하나요?
                </h2>

                <div className={styles.field}>
                    <label htmlFor="problem_statement" className={styles.label}>
                        문제 정의 (가장 중요) <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="problem_statement"
                        name="problem_statement"
                        value={formData.problem_statement}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                        placeholder="예: 독거노인 안부 확인에 매일 2시간이 소요되어 다른 업무 시간 부족"
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="target_audience" className={styles.label}>
                        누가 겪는 문제인가요? <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        id="target_audience"
                        name="target_audience"
                        value={formData.target_audience}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="예: 독거노인 담당 사회복지사"
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="situation" className={styles.label}>
                        언제 발생하나요?
                    </label>
                    <input
                        type="text"
                        id="situation"
                        name="situation"
                        value={formData.situation}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="예: 매일 아침 9시~11시"
                    />
                </div>
            </section>

            {/* 해결 섹션 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>⚙️</span>
                    어떻게 해결하나요?
                </h2>

                <div className={styles.field}>
                    <label htmlFor="solution" className={styles.label}>
                        해결 아이디어 <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="solution"
                        name="solution"
                        value={formData.solution}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                        placeholder="예: 자동 안부 확인 시스템 + 음성 기록 기능"
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="features" className={styles.label}>핵심 기능 3가지</label>
                    <textarea
                        id="features"
                        name="features"
                        value={formData.features}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                        placeholder="예: 1) 자동 문자 발송 2) 응답 집계 대시보드 3) 음성 인식 기록"
                    />
                </div>
            </section>

            {/* 프로토타입 섹션 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>🔗</span>
                    결과물 (링크)
                </h2>

                <div className={styles.field}>
                    <label htmlFor="prototype_link" className={styles.label}>
                        데모/사이트 링크
                    </label>
                    <input
                        type="url"
                        id="prototype_link"
                        name="prototype_link"
                        value={formData.prototype_link}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="https://..."
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="github_link" className={styles.label}>
                        소스코드 (GitHub 등)
                    </label>
                    <input
                        type="url"
                        id="github_link"
                        name="github_link"
                        value={formData.github_link}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="https://..."
                    />
                </div>
            </section>

            {/* 심화 항목 토글 */}
            <div className={styles.advancedToggle}>
                <details>
                    <summary style={{ cursor: 'pointer', padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem', fontWeight: 600 }}>
                        🔽 더 자세히 적고 싶다면? (선택 사항: 증거/가설/검증/확산)
                    </summary>
                    <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '3px solid #e5e7eb' }}>

                        <div className={styles.evidenceBox}>
                            <h3 className={styles.evidenceTitle}>
                                증거 (인터뷰/관찰/업무로그)
                                <span className={styles.privacyWarning}>
                                    ⚠️ 개인정보 금지
                                </span>
                            </h3>

                            <div className={styles.field}>
                                <label htmlFor="evidence1" className={styles.label}>증거 1</label>
                                <textarea
                                    id="evidence1"
                                    name="evidence1"
                                    value={formData.evidence1}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows={2}
                                    placeholder='예: 인터뷰 - "전화 연결이 안 되면 계속 재시도해야 해서 시간이 많이 걸립니다"'
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="evidence2" className={styles.label}>증거 2</label>
                                <textarea
                                    id="evidence2"
                                    name="evidence2"
                                    value={formData.evidence2}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows={2}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="evidence3" className={styles.label}>증거 3</label>
                                <textarea
                                    id="evidence3"
                                    name="evidence3"
                                    value={formData.evidence3}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* 가설 섹션 */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>💭</span>
                                가설 (선택)
                            </h2>

                            <div className={styles.field}>
                                <label htmlFor="hypothesis1" className={styles.label}>
                                    가설 1
                                </label>
                                <textarea
                                    id="hypothesis1"
                                    name="hypothesis1"
                                    value={formData.hypothesis1}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows={2}
                                    placeholder="예: 자동 문자 알림을 보내면 응답률이 50% 향상될 것이다"
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="hypothesis2" className={styles.label}>가설 2</label>
                                <textarea
                                    id="hypothesis2"
                                    name="hypothesis2"
                                    value={formData.hypothesis2}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows={2}
                                />
                            </div>
                        </section>

                        {/* 검증 섹션 */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>🔬</span>
                                검증 로그 (선택)
                            </h2>

                            <div className={styles.field}>
                                <label htmlFor="experiment_log" className={styles.label}>
                                    실험 내용 및 결과
                                </label>
                                <textarea
                                    id="experiment_log"
                                    name="experiment_log"
                                    value={formData.experiment_log}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows={3}
                                    placeholder="예: 10명 대상 2주 테스트 결과: 응답률 60% → 85% 증가"
                                />
                            </div>

                            <div className={styles.insightBox}>
                                <label htmlFor="wrong_assumption" className={styles.label}>
                                    🎓 틀렸던 가정 (Insight)
                                </label>
                                <textarea
                                    id="wrong_assumption"
                                    name="wrong_assumption"
                                    value={formData.wrong_assumption}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows={2}
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="next_test" className={styles.label}>
                                    다음에 검증할 것
                                </label>
                                <textarea
                                    id="next_test"
                                    name="next_test"
                                    value={formData.next_test}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows={2}
                                />
                            </div>
                        </section>

                        {/* 확산 섹션 */}
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>🌱</span>
                                확산 계획 (선택)
                            </h2>

                            <div className={styles.field}>
                                <label htmlFor="adoption_checklist" className={styles.label}>
                                    타 기관 재사용 체크리스트
                                </label>
                                <textarea
                                    id="adoption_checklist"
                                    name="adoption_checklist"
                                    value={formData.adoption_checklist}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows={3}
                                />
                            </div>
                        </section>
                    </div>
                </details>
            </div>

            {/* 버튼 */}
            <div className={styles.actions}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className={styles.cancelButton}
                    disabled={loading}
                >
                    취소
                </button>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                >
                    {loading ? '저장 중...' : '💾 저장하기'}
                </button>
            </div>
        </form>
    );
}
