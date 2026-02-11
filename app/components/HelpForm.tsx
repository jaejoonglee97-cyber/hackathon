// Help 카드 작성 폼 (클라이언트 컴포넌트)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './help-form.module.css';

interface HelpFormProps {
    teamId: string;
    initialData?: {
        type: string;
        title: string;
        description: string;
    };
    helpId?: string; // 수정 모드일 때
}

export default function HelpForm({ teamId, initialData, helpId }: HelpFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        type: initialData?.type || 'needed',
        title: initialData?.title || '',
        description: initialData?.description || '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
            const url = helpId ? `/api/helps/${helpId}` : '/api/helps';
            const method = helpId ? 'PATCH' : 'POST';

            const body = helpId
                ? formData // 수정 시
                : { ...formData, team_id: teamId }; // 생성 시

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '저장에 실패했습니다.');
            }

            // 성공 시 목록 페이지로 이동
            router.push('/helps');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.field}>
                <label htmlFor="type" className={styles.label}>
                    유형 <span className={styles.required}>*</span>
                </label>
                <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={styles.select}
                    required
                >
                    <option value="needed">🙏 도움 요청 (Needed)</option>
                    <option value="offered">🤝 도움 제공 (Offered)</option>
                </select>
                <p className={styles.hint}>
                    도움이 필요한지, 제공할 수 있는지 선택하세요.
                </p>
            </div>

            <div className={styles.field}>
                <label htmlFor="title" className={styles.label}>
                    제목 <span className={styles.required}>*</span>
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="예: 업무 자동화 스크립트 작성 도움 필요"
                    required
                    maxLength={100}
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="description" className={styles.label}>
                    상세 설명 <span className={styles.required}>*</span>
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows={6}
                    placeholder="예: Python으로 엑셀 데이터를 자동으로 Google Sheets에 업로드하는 스크립트가 필요합니다. 기본적인 코드는 있지만 에러 처리와 로깅 기능 추가에 도움이 필요합니다."
                    required
                />
                <p className={styles.hint}>
                    ⚠️ 개인정보(실명/연락처)는 입력하지 마세요.
                </p>
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
