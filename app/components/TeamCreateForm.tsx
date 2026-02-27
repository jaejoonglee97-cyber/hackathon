'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './TeamCreateForm.module.css';

export default function TeamCreateForm({ org }: { org?: string }) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '프로젝트 생성에 실패했습니다.');
            }

            // data.teamId is returned
            router.push(`/teams/${data.teamId}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.field}>
                <label htmlFor="name" className={styles.label}>
                    프로젝트 이름 <span className={styles.required}>*</span>
                    <span style={{ marginLeft: '8px', fontSize: '0.85em', color: '#6b7280', fontWeight: 'normal' }}>
                        (최대 3회 변경 가능)
                    </span>
                </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                    placeholder="해결하고자 하는 문제를 잘 드러내는 이름을 지어주세요"
                    required
                    maxLength={50}
                    autoFocus
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="orgDisabled" className={styles.label}>소속 기관</label>
                <input
                    id="orgDisabled"
                    type="text"
                    value={org || '(프로필 설정값)'}
                    className={styles.inputDisabled}
                    disabled
                />
                <p className={styles.hint}>
                    소속 기관은 프로필 설정에서 가져옵니다.
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
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading || !name.trim()}
                >
                    {loading ? '생성 중...' : '🚀 프로젝트 시작하기'}
                </button>
            </div>
        </form>
    );
}
