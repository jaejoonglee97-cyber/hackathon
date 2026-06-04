'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { AppEntry, Track } from '@/types/archive';
import { AWARD_ORDER, AWARD_STYLES, TRACK_COLORS, TRACKS } from '@/types/archive';
import styles from './page.module.css';

export default function AppsPage() {
    const [apps, setApps] = useState<AppEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selectedTrack, setSelectedTrack] = useState<Track | '전체'>('전체');
    const [selectedAward, setSelectedAward] = useState<string>('전체');

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await fetch('/api/apps');
                if (!res.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
                const data = await res.json();
                setApps(data.apps || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, []);

    // Derived stats
    const stats = useMemo(() => {
        const uniqueOrgs = new Set(apps.map(a => a.orgName));
        const uniqueTracks = new Set(apps.map(a => a.track));
        return {
            total: apps.length,
            orgs: uniqueOrgs.size,
            tracks: uniqueTracks.size,
        };
    }, [apps]);

    // Filtering and sorting
    const filteredApps = useMemo(() => {
        let result = [...apps];
        if (selectedTrack !== '전체') {
            result = result.filter(a => a.track === selectedTrack);
        }
        if (selectedAward !== '전체') {
            result = result.filter(a => a.award === selectedAward);
        }
        
        // Sort by award order (대상 -> 최우수 -> 우수 -> 장려 -> 없음)
        result.sort((a, b) => {
            const orderA = a.award ? AWARD_ORDER[a.award] : 99;
            const orderB = b.award ? AWARD_ORDER[b.award] : 99;
            return orderA - orderB;
        });
        
        return result;
    }, [apps, selectedTrack, selectedAward]);

    if (loading) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                로딩 중...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>
                {error}
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <h1 className={styles.title}>🏆 결과물 아카이브</h1>
                <p className={styles.subtitle}>
                    열매똑똑 해커톤에 참여한 사회복지사들의 반짝이는 아이디어와 결과물을 만나보세요.
                </p>
                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>총 제출작</div>
                        <div className={styles.statValue}>{stats.total}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>참여 기관</div>
                        <div className={styles.statValue}>{stats.orgs}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>트랙 수</div>
                        <div className={styles.statValue}>{stats.tracks}</div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className={`container ${styles.main}`}>
                {/* Filters */}
                <div className={styles.filterBar}>
                    <div className={styles.filterRow}>
                        <span className={styles.filterLabel}>트랙</span>
                        <button
                            className={`${styles.chip} ${selectedTrack === '전체' ? styles.chipActive : ''}`}
                            onClick={() => setSelectedTrack('전체')}
                        >전체</button>
                        {TRACKS.map((track) => (
                            <button
                                key={track}
                                className={`${styles.chip} ${selectedTrack === track ? styles.chipActive : ''}`}
                                onClick={() => setSelectedTrack(track)}
                            >{track}</button>
                        ))}
                    </div>
                    
                    <div className={styles.filterRow}>
                        <span className={styles.filterLabel}>수상</span>
                        <button 
                            className={`${styles.chip} ${selectedAward === '전체' ? styles.chipActive : ''}`}
                            onClick={() => setSelectedAward('전체')}
                        >전체</button>
                        {Object.keys(AWARD_ORDER).map(award => (
                            <button 
                                key={award}
                                className={`${styles.chip} ${selectedAward === award ? styles.chipActive : ''}`}
                                onClick={() => setSelectedAward(award)}
                            >{award}</button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className={styles.grid}>
                    {filteredApps.length === 0 ? (
                        <div className={styles.emptyState}>
                            조건에 맞는 결과물이 없습니다.
                        </div>
                    ) : (
                        filteredApps.map(app => (
                            <Link href={`/apps/${app.id}`} key={app.id} className={styles.card}>
                                {app.imageUrl ? (
                                    <img src={app.imageUrl} alt={app.name} className={styles.thumbnail} loading="lazy" />
                                ) : (
                                    <div className={styles.placeholderThumb} style={{ backgroundColor: TRACK_COLORS[app.track]?.accent || '#ccc' }}>
                                        {app.name.charAt(0)}
                                    </div>
                                )}
                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeader}>
                                        <h2 className={styles.appName}>{app.name}</h2>
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
                                    </div>
                                    <p className={styles.orgName}>{app.orgName}</p>
                                    
                                    <div className={styles.tags}>
                                        {app.tags.map(tag => (
                                            <span key={tag} className={styles.tag}>#{tag}</span>
                                        ))}
                                    </div>
                                    
                                    <p className={styles.description}>{app.description}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
