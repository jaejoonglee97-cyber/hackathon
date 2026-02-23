// Insight 카드 작성 폼 (클라이언트 컴포넌트)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './insight-form.module.css';

interface InsightFormProps {
    teamId: string;
    initialData?: {
        content: string;
        category: string;
    };
    insightId?: string; // 수정 모드일 때
}

export default function InsightForm({ teamId, initialData, insightId }: InsightFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        content: initialData?.content || '',
        category: initialData?.category || 'general',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const url = insightId ? `/api/insights/${insightId}` : '/api/insights';
            const method = insightId ? 'PATCH' : 'POST';

            const body = insightId
                ? formData
                : { ...formData, team_id: teamId };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '저장에 실패했습니다.');
            }

            router.push('/insights');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.insightBox}>
                <h3 className={styles.insightTitle}>
                    🎓 틀렸던 가정 또는 배운 점
                </h3>
                <p className={styles.insightDesc}>
                    프로젝트를 진행하면서 틀렸던 가정이나 새롭게 배운 인사이트를 공유하세요.
                    다른 참가자들에게 큰 도움이 됩니다!
                </p>
            </div>

            <div className={styles.field}>
                <label htmlFor="category" className={styles.label}>
                    카테고리
                </label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={styles.select}
                >
                    <option value="general">일반</option>
                    <option value="customer">고객 이해</option>
                    <option value="technical">기술</option>
                    <option value="process">프로세스</option>
                    <option value="team">협업</option>
                </select>
            </div>

            <div className={styles.field}>
                <label htmlFor="content" className={styles.label}>
                    인사이트 내용 <span className={styles.required}>*</span>
                </label>
                <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows={8}
                    placeholder="예: 노인분들이 모바일을 못 쓸 것이라 생각했지만, 실제로는 80%가 스마트폰을 보유하고 있었고 카카오톡을 능숙하게 사용했습니다. 기술에 대한 편견을 버리고 실제 사용자 리서치가 중요하다는 것을 배웠습니다."
                    required
                />
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className={styles.cancelButton}
                    disabled={loading}
                >
                    취소
                </button>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? '저장 중...' : '💾 저장하기'}
                </button>
            </div>
        </form>
    );
}
