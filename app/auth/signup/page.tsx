// 회원가입 페이지 — 이메일+비밀번호만 (프로필은 /onboarding/profile)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signup.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || '회원가입에 실패했습니다.');
            }

            alert('회원가입이 완료되었습니다. 로그인 후 프로필을 완료해주세요.');
            router.push('/auth/signin');
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
                    <h1 className={styles.title}>회원가입</h1>
                    <p className={styles.subtitle}>
                        열매똑똑 해커톤에 오신 것을 환영합니다
                    </p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.formGroup}>
                            <label htmlFor="signup-email" className={styles.label}>
                                이메일 <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="email"
                                id="signup-email"
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
                            <label htmlFor="signup-password" className={styles.label}>
                                비밀번호 <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="password"
                                id="signup-password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input}
                                required
                                placeholder="8자 이상, 영문+숫자 포함"
                                autoComplete="new-password"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="signup-password-confirm" className={styles.label}>
                                비밀번호 확인 <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="password"
                                id="signup-password-confirm"
                                name="passwordConfirm"
                                value={formData.passwordConfirm}
                                onChange={handleChange}
                                className={styles.input}
                                required
                                placeholder="비밀번호를 다시 입력하세요"
                                autoComplete="new-password"
                            />
                        </div>

                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? '처리 중...' : '회원가입'}
                        </button>

                        <p className={styles.loginLink}>
                            이미 계정이 있으신가요?{' '}
                            <Link href="/auth/signin">로그인</Link>
                        </p>
                    </form>
                </div>

                <div className={styles.infoNotice}>
                    <p>📋 회원가입 후 프로필을 완료하면 나만의 프로젝트가 자동 생성됩니다.</p>
                </div>
            </div>
        </div>
    );
}
