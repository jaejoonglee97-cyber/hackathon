// 프로젝트 편집 폼 (클라이언트 컴포넌트)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './edit-form.module.css';

interface ProjectEditFormProps {
    teamId: string;
    project: any;
    lockType?: 'soft' | 'hard';
    editReason?: string;
}

export default function ProjectEditForm({
    teamId,
    project,
    lockType,
    editReason,
}: ProjectEditFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            const response = await fetch(`/api/teams/${teamId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
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

            {/* Why 섹션 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>🎯</span>
                    Why - 왜 만드는가?
                </h2>

                <div className={styles.field}>
                    <label htmlFor="target_audience" className={styles.label}>
                        대상 (누구) <span className={styles.required}>*</span>
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
                        상황 (언제) <span className={styles.required}>*</span>
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

                <div className={styles.field}>
                    <label htmlFor="problem_statement" className={styles.label}>
                        문제 (무엇) <span className={styles.required}>*</span>
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

                <div className={styles.evidenceBox}>
                    <h3 className={styles.evidenceTitle}>
                        증거 (인터뷰/관찰/업무로그)
                        <span className={styles.privacyWarning}>
                            ⚠️ 개인정보(실명/연락처/사례식별정보) 금지
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
                            placeholder="예: 업무로그 - 하루 평균 50건 전화, 응답률 60%"
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
                            placeholder="예: 관찰 - 전화 후 수기 기록 작성에 30분 소요"
                        />
                    </div>
                </div>
            </section>

            {/* 가설 섹션 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>💭</span>
                    가설
                </h2>

                <div className={styles.field}>
                    <label htmlFor="hypothesis1" className={styles.label}>
                        가설 1 <span className={styles.required}>*</span>
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
                        placeholder="예: 음성 인식 기록 기능을 추가하면 기록 시간을 80% 단축할 수 있다"
                    />
                </div>
            </section>

            {/* 해결 섹션 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>⚙️</span>
                    해결 방법
                </h2>

                <div className={styles.field}>
                    <label htmlFor="solution" className={styles.label}>
                        솔루션 설명 <span className={styles.required}>*</span>
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
                    <label htmlFor="features" className={styles.label}>핵심 기능</label>
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
                    프로토타입/데모
                </h2>

                <div className={styles.field}>
                    <label htmlFor="prototype_link" className={styles.label}>
                        프로토타입 링크
                    </label>
                    <input
                        type="url"
                        id="prototype_link"
                        name="prototype_link"
                        value={formData.prototype_link}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="https://demo.example.com"
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="github_link" className={styles.label}>
                        GitHub 레포지토리
                    </label>
                    <input
                        type="url"
                        id="github_link"
                        name="github_link"
                        value={formData.github_link}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="https://github.com/username/repo"
                    />
                </div>
            </section>

            {/* 검증 섹션 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>🔬</span>
                    검증 로그
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
                        rows={4}
                        placeholder="예: 10명 대상 2주 테스트 결과: 응답률 60% → 85% 증가, 업무 시간 40% 단축"
                    />
                </div>

                <div className={styles.insightBox}>
                    <label htmlFor="wrong_assumption" className={styles.label}>
                        🎓 틀렸던 가정 1개 (Insight 강제)
                    </label>
                    <textarea
                        id="wrong_assumption"
                        name="wrong_assumption"
                        value={formData.wrong_assumption}
                        onChange={handleChange}
                        className={styles.textarea}
                        rows={3}
                        placeholder="예: 노인분들이 문자를 못 읽을 것이라 생각했지만, 실제로는 80%가 문자를 읽고 확인함"
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
                        placeholder="예: 음성 통화 자동화 기능 선호도 조사 필요"
                    />
                </div>
            </section>

            {/* 확산 섹션 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>🌱</span>
                    확산/운영 계획
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
                        rows={4}
                        placeholder="예: 1) 전화번호 DB 2) SMS 발송 권한 3) 음성 인식 API 4) 운영 매뉴얼"
                    />
                </div>
            </section>

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
