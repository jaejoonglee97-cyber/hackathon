'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminResetPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; tempPassword?: string } | null>(null);
    const [error, setError] = useState('');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const res = await fetch('/api/admin/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '초기화에 실패했습니다.');
            }

            setResult(data);
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
                maxWidth: '480px',
                background: 'var(--color-surface, white)',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: 'var(--shadow-md)',
            }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <a
                        href="/"
                        style={{
                            fontSize: '0.85rem',
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                        }}
                    >
                        ← 대시보드로 돌아가기
                    </a>
                </div>

                <h1 style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    marginBottom: '0.3rem',
                }}>
                    🔑 비밀번호 초기화
                </h1>
                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '1.5rem',
                    lineHeight: 1.6,
                }}>
                    관리자 전용 기능입니다. 참가자의 이메일을 입력하면 임시 비밀번호가 생성됩니다.
                </p>

                <form onSubmit={handleReset}>
                    <label style={{
                        display: 'block',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: 'var(--color-text-primary)',
                        marginBottom: '0.4rem',
                    }}>
                        참가자 이메일
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        required
                        style={{
                            width: '100%',
                            padding: '0.7rem 0.85rem',
                            border: '1px solid var(--color-border, #d1d5db)',
                            borderRadius: '0.5rem',
                            fontSize: '0.95rem',
                            marginBottom: '1rem',
                            outline: 'none',
                            backgroundColor: 'var(--color-bg, white)',
                            color: 'var(--color-text-primary)',
                            boxSizing: 'border-box',
                        }}
                    />

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

                    <button
                        type="submit"
                        disabled={loading || !email.trim()}
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
                            transition: 'opacity 0.2s',
                        }}
                    >
                        {loading ? '처리 중...' : '비밀번호 초기화'}
                    </button>
                </form>

                {result?.success && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1.2rem',
                        backgroundColor: '#ecfdf5',
                        border: '2px solid #34d399',
                        borderRadius: '0.75rem',
                    }}>
                        <p style={{ fontWeight: 700, color: '#065f46', marginBottom: '0.5rem', fontSize: '1rem' }}>
                            ✅ 초기화 완료!
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#047857', marginBottom: '0.75rem' }}>
                            {result.message}
                        </p>
                        <div style={{
                            background: 'white',
                            border: '1px solid #a7f3d0',
                            borderRadius: '0.5rem',
                            padding: '0.8rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                        }}>
                            <div>
                                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>임시 비밀번호:</span>
                                <p style={{
                                    fontSize: '1.3rem',
                                    fontWeight: 800,
                                    fontFamily: 'monospace',
                                    color: '#059669',
                                    margin: '0.2rem 0 0',
                                    letterSpacing: '2px',
                                }}>
                                    {result.tempPassword}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(result.tempPassword || '');
                                    alert('복사되었습니다!');
                                }}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    backgroundColor: '#d1fae5',
                                    border: '1px solid #6ee7b7',
                                    borderRadius: '0.4rem',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    color: '#065f46',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                📋 복사
                            </button>
                        </div>
                        <p style={{ marginTop: '0.7rem', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6 }}>
                            ⚠️ 이 비밀번호를 참가자에게 안전하게 전달해 주세요.<br />
                            로그인 후 참가자 본인이 직접 변경하도록 안내해 주세요.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
