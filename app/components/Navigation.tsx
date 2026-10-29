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

    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    // 로그인/회원가입 페이지에서는 네비게이션 숨김
    if (pathname?.startsWith('/auth/')) {
        return null;
    }

    const links = [
        { href: '/intro', label: '홈', active: pathname === '/' || !!pathname?.startsWith('/intro') },
        { href: '/dashboard', label: '해커톤 대시보드', active: !!pathname?.startsWith('/dashboard') },
        { href: '/guide', label: '이용가이드', active: !!pathname?.startsWith('/guide') },
        { href: '/qna', label: '문의게시판', active: !!pathname?.startsWith('/qna') },
        { href: '/apps', label: '🏆 결과물 아카이브', active: !!pathname?.startsWith('/apps') },
        ...(user && ['admin', 'judge'].includes(user.role)
            ? [{ href: '/admin/judge', label: '📋 심사', active: !!pathname?.startsWith('/admin/judge'), color: '#7c3aed' }]
            : []),
        ...(user && user.role === 'admin'
            ? [{ href: '/admin/scores', label: '📊 심사 집계', active: !!pathname?.startsWith('/admin/scores'), color: '#ef4444' }]
            : []),
    ];

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

                    {/* 메뉴 링크 (넓은 화면) */}
                    <div className={styles.navLinks}>
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={link.active ? styles.navLinkActive : styles.navLink}
                                style={link.color ? { color: link.color, fontWeight: 700 } : undefined}
                            >
                                {link.label}
                            </Link>
                        ))}
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

                        <button
                            type="button"
                            className={styles.menuButton}
                            aria-expanded={menuOpen}
                            aria-controls="site-menu"
                            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* 메뉴 펼침 (좁은 화면) */}
            <div id="site-menu" className={styles.menuPanel} hidden={!menuOpen}>
                <div className="container">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={link.active ? styles.panelLinkActive : styles.panelLink}
                            style={link.color ? { color: link.color } : undefined}
                            aria-current={link.active ? 'page' : undefined}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {!loading && (
                        <div className={styles.panelAuth}>
                            {user ? (
                                <>
                                    <span className={styles.panelUser}>{user.name || user.email}</span>
                                    <button onClick={handleSignOut} className={styles.signOutButton}>
                                        로그아웃
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/signin" className={styles.signInLink}>로그인</Link>
                                    <Link href="/auth/signup" className={styles.signUpButton}>회원가입</Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
