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
        // Other
        track: project?.track || '', // 분야 (추가)

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

            {/* 1. 프로젝트명 */}
            <section className={styles.section} style={{ border: '2px solid #5b21b6', backgroundColor: '#f5f3ff' }}>
                <h2 className={styles.sectionTitle} style={{ color: '#4c1d95' }}>
                    <span className={styles.sectionIcon}>1️⃣</span>
                    프로젝트명
                </h2>
                <div className={styles.field}>
                    <label htmlFor="teamName" className={styles.label}>
                        프로젝트(팀) 이름
                        <span style={{ marginLeft: '10px', fontSize: '0.9em', color: remainingEdits > 0 ? '#10b981' : '#ef4444' }}>
                            (남은 변경 횟수: {remainingEdits}회 / 총 3회 <span style={{ color: '#6b7280', fontWeight: 'normal' }}>— 이름만 제한, 내용은 무제한 수정 가능</span>)
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
                    <div className={styles.field} style={{ marginTop: '1rem' }}>
                        <label htmlFor="track" className={styles.label}>
                            분야 선택 <span className={styles.required}>*</span>
                        </label>
                        <select
                            id="track"
                            name="track"
                            value={formData.track}
                            onChange={handleChange}
                            className={styles.input}
                            required
                        >
                            <option value="">선택해주세요</option>
                            <option value="현장 업무경감 자동화">1) 현장 업무경감 자동화</option>
                            <option value="이용자 지원 및 접근성 개선">2) 이용자 지원 및 접근성 개선</option>
                            <option value="협업·지식관리·성과지표">3) 협업·지식관리·성과지표</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* 진행 단계 선택 (Admin/Self Check) */}
            <section className={styles.section} style={{ border: '2px solid #2563eb', backgroundColor: '#eff6ff' }}>
                <h2 className={styles.sectionTitle} style={{ color: '#1e40af' }}>
                    <span className={styles.sectionIcon}>🚩</span>
                    진행 단계
                </h2>
                <div className={styles.field}>
                    <label htmlFor="stage" className={styles.label}>
                        현재 프로젝트의 진행 상황을 선택해주세요.
                    </label>
                    <select
                        id="stage"
                        name="stage"
                        value={stage}
                        onChange={handleStageChange}
                        className={styles.input}
                        style={{ fontWeight: 'bold', color: '#1e3a8a' }}
                    >
                        <option value="intro">1단계: 기획 (아이디어 구체화)</option>
                        <option value="validate">2단계: 개발/검증 (프로토타입 등)</option>
                        <option value="complete">3단계: 완성 (최종 결과물)</option>
                    </select>
                </div>
            </section>

            {/* 2. 프로젝트 목적 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>2️⃣</span>
                    프로젝트 목적
                </h2>

                <div className={styles.field}>
                    <label htmlFor="problem_statement" className={styles.label}>
                        이 프로젝트를 수행하는 목적은 무엇인가요? <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="problem_statement"
                        name="problem_statement"
                        value={formData.problem_statement}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                        placeholder="예: 독거노인 안부 확인 업무의 비효율을 개선하여 사회복지사의 업무 부담을 줄이고자 함."
                    />
                </div>
            </section>

            {/* 3. 문제의식 (프로젝트 필요성) */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>3️⃣</span>
                    문제의식 (프로젝트 필요성)
                </h2>

                <div className={styles.field}>
                    <label htmlFor="situation" className={styles.label}>
                        1) 계획 배경 <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="situation"
                        name="situation"
                        value={formData.situation}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                        placeholder="어떤 배경이나 상황에서 이 프로젝트를 계획하게 되었나요?"
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="evidence1" className={styles.label}>
                        2) 기존 프로젝트와의 차별성 <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="evidence1"
                        name="evidence1"
                        value={formData.evidence1}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                        placeholder="기존의 유사한 문제 해결 방식과 비교했을 때 무엇이 다른가요?"
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="evidence2" className={styles.label}>
                        3) 프로젝트의 강점 <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="evidence2"
                        name="evidence2"
                        value={formData.evidence2}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                        placeholder="우리 팀 프로젝트만의 특별한 강점은 무엇인가요?"
                    />
                </div>
            </section>

            {/* 4. 프로젝트 내용 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>4️⃣</span>
                    프로젝트 내용
                </h2>

                <div className={styles.field}>
                    <label htmlFor="solution" className={styles.label}>
                        핵심 내용 및 기능 <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="solution"
                        name="solution"
                        value={formData.solution}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={5}
                        placeholder="구체적인 해결 방안, 주요 기능, 구현 방식 등을 자유롭게 기술해주세요."
                    />
                </div>
                {/* features를 보조 필드로 사용하거나 위 solution에 통합 유도 */}
                <div className={styles.field}>
                    <label htmlFor="features" className={styles.label}>
                        (선택) 추가 상세 기능 설명
                    </label>
                    <textarea
                        id="features"
                        name="features"
                        value={formData.features}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                        placeholder="필요한 경우 주요 기능을 목록으로 정리해주세요."
                    />
                </div>
            </section>

            {/* 결과물 링크 (별도 섹션 유지) */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>🔗</span>
                    결과물 링크 (선택)
                </h2>
                <div className={styles.field}>
                    <label className={styles.label}>데모/소스코드 링크</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            type="url"
                            name="prototype_link"
                            value={formData.prototype_link}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="프로토타입/데모 링크 (https://...)"
                        />
                        <input
                            type="url"
                            name="github_link"
                            value={formData.github_link}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="GitHub 등 소스코드 링크 (https://...)"
                        />
                    </div>
                </div>
            </section>

            {/* 5. 기대효과 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>5️⃣</span>
                    프로젝트로 인한 기대효과
                </h2>

                <div className={styles.field}>
                    <label htmlFor="hypothesis1" className={styles.label}>
                        기대효과를 작성해주세요 <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="hypothesis1"
                        name="hypothesis1"
                        value={formData.hypothesis1}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                        placeholder="이 프로젝트를 통해 어떤 긍정적인 변화(정량적/정성적)를 기대하나요?"
                    />
                </div>
            </section>

            {/* 6. 활용 계획 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>6️⃣</span>
                    프로젝트의 활용 계획
                </h2>

                <div className={styles.field}>
                    <label htmlFor="experiment_log" className={styles.label}>
                        1) 사용 계획 <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="experiment_log"
                        name="experiment_log"
                        value={formData.experiment_log}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                        placeholder="완성된 결과물을 실제 현장에서 구체적으로 어떻게 사용할 계획인가요?"
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="adoption_checklist" className={styles.label}>
                        2) 확산 전략 <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        id="adoption_checklist"
                        name="adoption_checklist"
                        value={formData.adoption_checklist}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                        placeholder="다른 기관이나 사회복지 현장에 이 모델을 어떻게 알리고 확산시킬 계획인가요?"
                    />
                </div>
            </section>

            {/* Hidden Fields for state preservation */}
            <div style={{ display: 'none' }}>
                <input name="target_audience" value={formData.target_audience} readOnly />
                <input name="evidence3" value={formData.evidence3} readOnly />
                <input name="hypothesis2" value={formData.hypothesis2} readOnly />
                <input name="wrong_assumption" value={formData.wrong_assumption} readOnly />
                <input name="next_test" value={formData.next_test} readOnly />
            </div>

            {/* 하단 저장 알림 (사용자 요청 반영) */}
            {success && (
                <div className={styles.successBanner} style={{ marginTop: '2rem', textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                    ✅ 저장되었습니다! 잠시 후 상세 페이지로 이동합니다...
                </div>
            )}

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
                {loading && (
                    <span style={{
                        color: '#2563eb',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        animation: 'pulse 1.5s infinite'
                    }}>
                        ⏳ 저장 중입니다... (잠시만 기다려주세요)
                    </span>
                )}
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                >
                    💾 저장하기
                </button>
            </div>
        </form>
    );
}
