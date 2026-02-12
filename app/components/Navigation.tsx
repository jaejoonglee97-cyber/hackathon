// 메인 네비게이션 헤더 (클라이언트 컴포넌트)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './navigation.module.css';

export default function Navigation() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => {
                if (data.user) {
                    setUser(data.user);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    // 로그인/회원가입 페이지에서는 네비게이션 숨김
    if (pathname?.startsWith('/auth/')) {
        return null;
    }

    return (
        <nav className={styles.nav}>
            <div className="container">
                <div className={styles.navContent}>
                    <Link href="/" className={styles.logo}>
                        🚀 Hackathon Hub
                    </Link>

                    {!loading && user && (
                        <>
                            <div className={styles.navLinks}>
                                <Link
                                    href="/"
                                    className={pathname === '/' ? styles.navLinkActive : styles.navLink}
                                >
                                    대시보드
                                </Link>
                                <Link
                                    href="/guide"
                                    className={pathname?.startsWith('/guide') ? styles.navLinkActive : styles.navLink}
                                >
                                    📚 가이드 & QnA
                                </Link>
                            </div>

                            <div className={styles.userMenu}>
                                <span className={styles.userName}>{user.name || user.email}</span>
                                <button onClick={handleSignOut} className={styles.signOutButton}>
                                    로그아웃
                                </button>
                            </div>
                        </>
                    )}

                    {!loading && !user && (
                        <div className={styles.authButtons}>
                            <Link href="/auth/signin" className={styles.signInLink}>
                                로그인
                            </Link>
                            <Link href="/auth/signup" className={styles.signUpButton}>
                                회원가입
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
