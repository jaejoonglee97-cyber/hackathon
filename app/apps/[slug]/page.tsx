import { getAppBySlug, getAllApps } from '@/lib/sheets';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import CommentSection from '@/app/components/CommentSection';
import { AWARD_STYLES, TRACK_COLORS } from '@/types/archive';
import styles from './page.module.css';

export const revalidate = 60; // ISR 60 seconds

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const app = await getAppBySlug(params.slug);
    if (!app) return { title: '앱을 찾을 수 없습니다' };
    return {
        title: `${app.name} | 결과물 아카이브`,
        description: app.description,
        openGraph: {
            title: `${app.name} | 결과물 아카이브`,
            description: app.description,
            images: app.imageUrl ? [{ url: app.imageUrl }] : undefined,
        },
    };
}

export default async function AppDetailPage({ params }: { params: { slug: string } }) {
    const app = await getAppBySlug(params.slug);
    
    if (!app) {
        notFound();
    }

    const user = await getCurrentUser();

    return (
        <div className={styles.container}>
            <Link href="/apps" className={styles.backLink}>
                ← 목록으로 돌아가기
            </Link>

            <div className={styles.hero}>
                {app.imageUrl ? (
                    <img src={app.imageUrl} alt={app.name} className={styles.heroImage} />
                ) : (
                    <div 
                        className={styles.placeholderImage} 
                        style={{ backgroundColor: TRACK_COLORS[app.track]?.accent || '#ccc' }}
                    >
                        {app.name.charAt(0)}
                    </div>
                )}

                <div className={styles.headerInfo}>
                    <h1 className={styles.title}>{app.name}</h1>
                    <p className={styles.orgName}>{app.orgName}</p>
                    
                    <div className={styles.badges}>
                        <span 
                            className={styles.badge}
                            style={{
                                backgroundColor: TRACK_COLORS[app.track]?.bg,
                                color: TRACK_COLORS[app.track]?.color
                            }}
                        >
                            {app.track}
                        </span>
                        
                        {app.award && (
                            <span 
                                className={styles.badge}
                                style={{
                                    backgroundColor: AWARD_STYLES[app.award]?.bg,
                                    color: AWARD_STYLES[app.award]?.color
                                }}
                            >
                                {app.award}
                            </span>
                        )}
                        
                        {app.tags.map(tag => (
                            <span key={tag} className={styles.badge} style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.layout}>
                <div className={styles.main}>
                    {/* PRD Rule: Why(problem) first! */}
                    <section className={`${styles.section} ${styles.problemSection}`}>
                        <h2 className={styles.sectionTitle}>🎯 해결하려는 문제</h2>
                        <div className={styles.sectionContent}>{app.problem}</div>
                    </section>

                    <section className={`${styles.section} ${styles.solutionSection}`}>
                        <h2 className={styles.sectionTitle}>🔧 솔루션</h2>
                        <div className={styles.sectionContent}>{app.solution}</div>
                    </section>

                    <section className={`${styles.section} ${styles.descriptionSection}`}>
                        <h2 className={styles.sectionTitle}>💡 한 줄 소개</h2>
                        <div className={styles.sectionContent}>{app.description}</div>
                    </section>

                    {/* Link Buttons */}
                    {(app.appUrl || app.videoUrl || app.slideUrl) && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>📎 관련 링크</h2>
                            <div className={styles.linkButtons}>
                                {app.appUrl && (
                                    <a href={app.appUrl} target="_blank" rel="noopener noreferrer" className={`${styles.linkButton} ${styles.appButton}`}>
                                        🚀 앱 바로가기
                                    </a>
                                )}
                                {app.videoUrl && (
                                    <a href={app.videoUrl} target="_blank" rel="noopener noreferrer" className={`${styles.linkButton} ${styles.videoButton}`}>
                                        🎬 시연 영상 보기
                                    </a>
                                )}
                                {app.slideUrl && (
                                    <a href={app.slideUrl} target="_blank" rel="noopener noreferrer" className={`${styles.linkButton} ${styles.slideButton}`}>
                                        📄 발표자료 보기
                                    </a>
                                )}
                            </div>
                        </section>
                    )}

                    <CommentSection appId={app.id} initialUser={user} />
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.sidebarCard}>
                        <div className={styles.sidebarItem}>
                            <span className={styles.sidebarLabel}>트랙</span>
                            <span className={styles.sidebarValue}>{app.track}</span>
                        </div>
                        <div className={styles.sidebarItem}>
                            <span className={styles.sidebarLabel}>기관명</span>
                            <span className={styles.sidebarValue}>{app.orgName}</span>
                        </div>
                        <div className={styles.sidebarItem}>
                            <span className={styles.sidebarLabel}>수상 내역</span>
                            <span className={styles.sidebarValue}>{app.award || '해당 없음'}</span>
                        </div>
                        {/* PRD Rule: Score hidden. No score displayed here. */}
                    </div>
                </aside>
            </div>
        </div>
    );
}
