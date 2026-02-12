// 메인 네비게이션 헤더 (클라이언트 컴포넌트)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './navigation.module.css';

interface NavigationProps {
    initialUser?: any;
}

export default function Navigation({ initialUser }: NavigationProps) {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(initialUser || null);
    // If initialUser is explicitly null (guest from server) or object (user from server), not loading.
    // Only if undefined (not passed), we are loading.
    const [loading, setLoading] = useState(initialUser === undefined);

    // Sync state with prop (e.g. after router.refresh())
    useEffect(() => {
        if (initialUser !== undefined) {
            setUser(initialUser);
            setLoading(false);
        }
    }, [initialUser]);

    useEffect(() => {
        // If we have initialUser, skip client-side fetch to avoid redundant calls and state clashes
        if (initialUser !== undefined) return;

        // If we already have a user from props, we might not need to fetch, 
        // but fetching ensures client-side session is valid and up-to-date.
        // However, to avoid "flash", we use initialUser.

        // If no initialUser, we must fetch. 
        // If initialUser is present, we can optionally fetch to validate or just trust server.
        // Let's trust server for now or fetch silently.

        fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => {
                if (data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, [initialUser]);

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
                            📚 이용가이드
                        </Link>
                        <Link
                            href="/qna"
                            className={styles.qnaLink}
                        >
                            💬 문의게시판
                        </Link>
                    </div>

                    {!loading && user && (
                        <div className={styles.userMenu}>
                            <span className={styles.userName}>{user.name || user.email}</span>
                            <button onClick={handleSignOut} className={styles.signOutButton}>
                                로그아웃
                            </button>
                        </div>
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

                    {/* Seoul Association of Social Workers Logo */}
                    <a href="https://sasw.or.kr" target="_blank" rel="noopener noreferrer">
                        <img
                            src="/logo.png"
                            alt="서울특별시사회복지사협회"
                            className={styles.saswLogo}
                        />
                    </a>
                </div>
            </div>
        </nav>
    );
}
