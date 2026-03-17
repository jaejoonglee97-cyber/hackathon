// 메인 네비게이션 헤더 (클라이언트 컴포넌트)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import styles from './navigation.module.css';

interface NavigationProps {
    initialUser?: any;
}

export default function Navigation({ initialUser }: NavigationProps) {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(initialUser || null);
    const [loading, setLoading] = useState(initialUser === undefined);
    const { theme, toggle } = useTheme();

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
                    {/* 로고 영역 */}
                    <div className={styles.logoGroup}>
                        <a href="https://seoul.chest.or.kr/" target="_blank" rel="noopener noreferrer">
                            <img src="/love-chest.png" alt="사랑의열매" className={styles.primaryLogo} />
                        </a>
                        <div className={styles.divider} />
                        <a href="https://sasw.or.kr" target="_blank" rel="noopener noreferrer">
                            <img src="/logo.png" alt="서울특별시사회복지사협회" className={styles.secondaryLogo} />
                        </a>
                    </div>

                    {/* 메뉴 링크 (중앙/좌측) */}
                    <div className={styles.navLinks}>
                        <Link
                            href="/"
                            className={pathname === '/' ? styles.navLinkActive : styles.navLink}
                        >
                            대시보드
                        </Link>
                        <Link
                            href="/intro"
                            className={pathname?.startsWith('/intro') ? styles.navLinkActive : styles.navLink}
                        >
                            열매똑똑 스마트워크란?
                        </Link>
                        <Link
                            href="/guide"
                            className={pathname?.startsWith('/guide') ? styles.navLinkActive : styles.navLink}
                        >
                            이용가이드
                        </Link>
                        <Link
                            href="/qna"
                            className={pathname?.startsWith('/qna') ? styles.navLinkActive : styles.navLink}
                        >
                            문의게시판
                        </Link>
                        {/* 심사위원/관리자만 보이는 채점 메뉴 */}
                        {user && ['admin', 'judge'].includes(user.role) && (
                            <Link
                                href="/admin/judge"
                                className={pathname?.startsWith('/admin/judge') ? styles.navLinkActive : styles.navLink}
                                style={{ color: '#7c3aed', fontWeight: 700 }}
                            >
                                📋 채점
                            </Link>
                        )}
                        {/* 관리자만 보이는 채점 집계 메뉴 */}
                        {user && user.role === 'admin' && (
                            <Link
                                href="/admin/scores"
                                className={pathname?.startsWith('/admin/scores') ? styles.navLinkActive : styles.navLink}
                                style={{ color: '#ef4444', fontWeight: 700 }}
                            >
                                📊 채점 집계
                            </Link>
                        )}
                    </div>

                    {/* 우측 그룹 (테마 + 유저메뉴) */}
                    <div className={styles.rightGroup}>
                        <button
                            onClick={toggle}
                            className={styles.themeToggle}
                            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
                            title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>

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
                    </div>
                </div>
            </div>
        </nav>
    );
}
