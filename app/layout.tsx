import type { Metadata } from 'next';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { ThemeProvider } from './components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
    title: '열매똑똑 해커톤 | 사회복지 현장을 바꾸는 도전',
    description: '서울 2만 사회복지사 앞에 내 앱이 올라간다. AI와 디지털 도구로 현장 문제를 해결하는 해커톤.',
    keywords: ['해커톤', '사회복지', '디지털전환', 'AI', '스마트워크', '열매똑똑'],
    authors: [{ name: '열매똑똑' }],
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#7c3aed',
    openGraph: {
        title: '열매똑똑 해커톤 | 사회복지 현장을 바꾸는 도전',
        description: '서울 2만 사회복지사 앞에 내 앱이 올라간다. AI와 디지털 도구로 현장 문제를 해결하는 해커톤.',
        type: 'website',
        locale: 'ko_KR',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '열매똑똑 해커톤' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: '열매똑똑 해커톤 | 사회복지 현장을 바꾸는 도전',
        description: '서울 2만 사회복지사 앞에 내 앱이 올라간다.',
        images: ['/og-image.png'],
    },
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
                <ThemeProvider>
                    <Navigation initialUser={user} />
                    <main style={{ minHeight: 'calc(100vh - 160px)' }}>
                        {children}
                    </main>
                    <Footer />
                </ThemeProvider>
            </body>
        </html>
    );
}
