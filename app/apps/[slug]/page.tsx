import { getAppBySlug } from '@/lib/sheets';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import CommentSection from '@/app/components/CommentSection';
import { TRACK_COLORS } from '@/types/archive';
import styles from './page.module.css';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const app = await getAppBySlug(params.slug);
    if (!app) return { title: '앱을 찾을 수 없습니다' };
    return {
        title: `${app.name} | 결과물 아카이브`,
        description: app.description,
        openGraph: {
            title: `${app.name} | 결과물 아카이브`,
            description: app.description,
        },
    };
}

export default async function AppDetailPage({ params }: { params: { slug: string } }) {
    const app = await getAppBySlug(params.slug);

    if (!app) {
        notFound();
    }

    const user = await getCurrentUser();
    const accent = { '--accent': TRACK_COLORS[app.track]?.accent ?? 'var(--color-primary)' } as CSSProperties;

    const linkLabel = {
        live: '바로 체험 가능',
        expired: '사용기한 만료',
        none: '미제출',
    }[app.linkStatus];

    const blocks = [
        { title: '해결하려는 문제', body: app.problem },
        { title: '누구를 위한 것인가요', body: app.targetAudience },
        { title: '해결 아이디어', body: app.solution },
        { title: '주요 기능', body: app.features },
    ].filter((block) => block.body.trim());

    return (
        <article className={styles.page} style={accent}>
            <div className={styles.inner}>
                <nav className={styles.topbar} aria-label="이동 경로">
                    <Link href="/apps" className={styles.back} aria-label="아카이브 목록으로">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
                    </Link>
                    <ol className={styles.crumbs}>
                        <li><Link href="/apps">결과물 아카이브</Link></li>
                        <li>{app.track}</li>
                    </ol>
                </nav>

                <header className={styles.header}>
                    <p className={styles.eyebrow}>{app.track}</p>
                    <h1 className={styles.title}>{app.name}</h1>
                    <p className={styles.org}>{app.orgName}</p>
                    {app.award && <span className={styles.award}>🏆 {app.award}</span>}
                </header>

                <dl className={styles.meta}>
                    <div><dt>기관</dt><dd>{app.orgName}</dd></div>
                    <div><dt>분야</dt><dd>{app.track}</dd></div>
                    <div><dt>수상</dt><dd>{app.award || '—'}</dd></div>
                    <div>
                        <dt>웹앱</dt>
                        <dd className={app.linkStatus === 'live' ? styles.live : undefined}>{linkLabel}</dd>
                    </div>
                </dl>

                {app.linkStatus === 'live' && app.appUrl ? (
                    <a href={app.appUrl} target="_blank" rel="noopener noreferrer" className={styles.cta}>
                        앱 바로 체험하기
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
                    </a>
                ) : (
                    <div className={styles.notice}>
                        <strong>{app.linkStatus === 'expired' ? '웹앱 사용기한 만료' : '웹앱 미제출'}</strong>
                        <p>
                            지금은 웹앱으로 직접 체험할 수 없어요. 대신 기관이 제안한 문제 인식과 해결 아이디어를
                            아래에서 확인하고, 우리 기관에 맞게 활용해 보세요.
                        </p>
                    </div>
                )}

                <div className={styles.blocks}>
                    {blocks.map((block) => (
                        <details key={block.title} className={styles.block} open>
                            <summary>{block.title}</summary>
                            <div className={styles.blockBody}>{block.body}</div>
                        </details>
                    ))}
                </div>

                <section className={styles.comments}>
                    <CommentSection appId={app.id} initialUser={user} />
                </section>
            </div>
        </article>
    );
}
