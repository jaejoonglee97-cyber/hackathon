import type { Metadata } from 'next';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import './globals.css';

export const metadata: Metadata = {
    title: '열매똑똑 해커톤 보드 | 투명한 협력 플랫폼',
    description: '사회복지 현장 문제를 해결하는 해커톤. 함께 배우고 검증하며 성장하는 협력 중심 플랫폼입니다.',
    keywords: ['해커톤', '사회복지', '투명성', '협력', '검증', '학습'],
    authors: [{ name: '열매똑똑' }],
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#0d9488',
};

import { getCurrentUser } from '@/lib/auth';

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    return (
        <html lang="ko">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body>
                <Navigation initialUser={user} />
                <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
