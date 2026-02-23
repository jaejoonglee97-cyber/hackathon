// 회원가입 페이지 — 이메일+비밀번호만 (프로필은 /onboarding/profile)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signup.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
    });
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('이름을 입력해 주세요.');
            return;
        }
        if (formData.password !== formData.passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!agreed) {
            setError('이용약관 및 개인정보 수집·이용에 동의해 주세요.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
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
                            <label htmlFor="signup-name" className={styles.label}>
                                이름 <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="signup-name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={styles.input}
                                required
                                placeholder="실명을 입력해 주세요"
                                autoComplete="name"
                            />
                        </div>

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

                        {/* 이용약관 동의 */}
                        <div style={{
                            marginTop: '0.5rem',
                            border: '1px solid var(--color-border, #e5e7eb)',
                            borderRadius: '0.5rem',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                maxHeight: '140px',
                                overflowY: 'auto',
                                padding: '0.85rem 1rem',
                                backgroundColor: 'var(--color-bg-secondary, #f9fafb)',
                                fontSize: '0.82rem',
                                lineHeight: 1.75,
                                color: 'var(--color-text-secondary, #4b5563)',
                            }}>
                                <strong style={{ fontSize: '0.88rem', color: 'var(--color-text-primary, #111)' }}>열매똑똑 해커톤 이용약관 및 개인정보 수집·이용 동의</strong><br /><br />
                                <strong>1. 목적</strong><br />
                                본 서비스는 서울특별시사회복지사협회가 운영하는 &ldquo;열매똑똑 해커톤&rdquo; 참가 접수 및 프로젝트 관리를 위해 제공됩니다.<br /><br />
                                <strong>2. 수집하는 개인정보 항목</strong><br />
                                이메일, 비밀번호(암호화 저장), 이름, 소속기관, 연락처(선택), 참여 유형<br /><br />
                                <strong>3. 수집 및 이용 목적</strong><br />
                                • 해커톤 참가 접수 및 본인 확인<br />
                                • 프로젝트 제출·관리 및 심사 진행<br />
                                • 수상자 안내 및 경품 배송<br />
                                • 서비스 개선 및 통계 분석 (비식별 처리)<br /><br />
                                <strong>4. 보유 및 이용 기간</strong><br />
                                해커톤 종료 후 6개월까지 보관하며, 이후 지체 없이 파기합니다. 단, 수상작 공개에 동의한 경우 해당 프로젝트 내용은 사례 자료로 계속 활용될 수 있습니다.<br /><br />
                                <strong>5. 참가자 유의사항</strong><br />
                                • 제출물에 이용자(클라이언트) 개인정보를 포함하지 마세요.<br />
                                • 타인의 저작물을 무단 사용하지 마세요.<br />
                                • 부정행위가 확인될 경우 수상이 취소될 수 있습니다.<br /><br />
                                <strong>6. 동의 거부 권리</strong><br />
                                동의를 거부할 수 있으나, 이 경우 해커톤 참여가 제한됩니다.
                            </div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.7rem 1rem',
                                borderTop: '1px solid var(--color-border, #e5e7eb)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: 'var(--color-text-primary, #111)',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary, #0d9488)' }}
                                />
                                위 이용약관 및 개인정보 수집·이용에 동의합니다.
                            </label>
                        </div>

                        <button type="submit" className={styles.submitButton} disabled={loading || !agreed}>
                            {loading ? '처리 중...' : '회원가입'}
                        </button>

                        <p className={styles.loginLink}>
                            이미 계정이 있으신가요?{' '}
                            <Link href="/auth/signin">로그인</Link>
                        </p>
                    </form>
                </div>

                <div className={styles.infoNotice}>
                    <p>📋 회원가입 → 프로필 작성 → 프로젝트 등록 순서로 진행됩니다.</p>
                </div>
            </div>
        </div>
    );
}
