// 로그인 페이지
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signin.module.css';

export default function SigninPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '로그인에 실패했습니다.');
            }

            // 로그인 성공
            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>로그인</h1>
                    <p className={styles.subtitle}>
                        열매똑똑 해커톤 보드에 접속하세요
                    </p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>
                                이메일
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.input}
                                required
                                placeholder="example@email.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.label}>
                                비밀번호
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input}
                                required
                                placeholder="비밀번호를 입력하세요"
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>

                        <div className={styles.divider}>
                            <span>또는</span>
                        </div>

                        <p className={styles.signupLink}>
                            아직 계정이 없으신가요?{' '}
                            <Link href="/auth/signup">회원가입</Link>
                        </p>
                    </form>
                </div>

                <div className={styles.securityNotice}>
                    <p>🔒 보안 알림</p>
                    <ul>
                        <li>5회 이상 로그인 실패 시 30분간 잠금됩니다.</li>
                        <li>비밀번호는 암호화되어 저장됩니다.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
