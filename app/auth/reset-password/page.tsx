'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!email || !name.trim() || !newPassword) {
            setError('모든 항목을 입력해 주세요.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            setError('비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name: name.trim(), newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '재설정에 실패했습니다.');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 160px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '440px',
                background: 'var(--color-surface, white)',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: 'var(--shadow-md)',
            }}>
                <h1 style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    marginBottom: '0.3rem',
                }}>
                    🔑 비밀번호 재설정
                </h1>
                <p style={{
                    fontSize: '0.88rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '1.5rem',
                    lineHeight: 1.6,
                }}>
                    가입 시 입력한 <strong>이메일</strong>과 <strong>이름</strong>을 확인하여 비밀번호를 재설정합니다.
                </p>

                {success ? (
                    <div style={{
                        padding: '1.2rem',
                        backgroundColor: '#ecfdf5',
                        border: '2px solid #34d399',
                        borderRadius: '0.75rem',
                        textAlign: 'center',
                    }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#065f46', marginBottom: '0.5rem' }}>
                            ✅ 비밀번호가 재설정되었습니다!
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#047857', marginBottom: '1rem' }}>
                            새 비밀번호로 로그인해 주세요.
                        </p>
                        <Link
                            href="/auth/signin"
                            style={{
                                display: 'inline-block',
                                padding: '0.6rem 1.5rem',
                                background: 'var(--gradient-primary, #0d9488)',
                                color: 'white',
                                borderRadius: '0.5rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                            }}
                        >
                            로그인 페이지로 이동
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                padding: '0.7rem 1rem',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fca5a5',
                                borderRadius: '0.5rem',
                                color: '#b91c1c',
                                fontSize: '0.88rem',
                                marginBottom: '1rem',
                            }}>
                                ❌ {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '0.85rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--color-text-primary)' }}>
                                이메일
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="가입 시 사용한 이메일"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 0.85rem',
                                    border: '1px solid var(--color-border, #d1d5db)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.95rem',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '0.85rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--color-text-primary)' }}>
                                이름
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="가입 시 입력한 이름"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 0.85rem',
                                    border: '1px solid var(--color-border, #d1d5db)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.95rem',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '0.85rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--color-text-primary)' }}>
                                새 비밀번호
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="8자 이상, 영문+숫자 포함"
                                required
                                autoComplete="new-password"
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 0.85rem',
                                    border: '1px solid var(--color-border, #d1d5db)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.95rem',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem', color: 'var(--color-text-primary)' }}>
                                새 비밀번호 확인
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="새 비밀번호를 다시 입력"
                                required
                                autoComplete="new-password"
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 0.85rem',
                                    border: '1px solid var(--color-border, #d1d5db)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.95rem',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--gradient-primary, #0d9488)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                            }}
                        >
                            {loading ? '처리 중...' : '비밀번호 재설정'}
                        </button>

                        <p style={{
                            textAlign: 'center',
                            marginTop: '1rem',
                            fontSize: '0.88rem',
                            color: 'var(--color-text-secondary)',
                        }}>
                            <Link href="/auth/signin" style={{ color: 'var(--color-primary)' }}>
                                로그인으로 돌아가기
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
