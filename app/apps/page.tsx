'use client';

import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import Link from 'next/link';
import type { AppEntry, Track } from '@/types/archive';
import { AWARD_ORDER, TRACK_COLORS, TRACKS } from '@/types/archive';
import styles from './page.module.css';

const PAGE_SIZE = 12;
const SUGGESTED_KEYWORDS = ['후원물품', '일지', '공문', '개인예산제', '실적', 'AI'];

type StatusFilter = 'all' | 'live' | 'idea';

const accentStyle = (track: Track) =>
    ({ '--accent': TRACK_COLORS[track]?.accent ?? 'var(--color-primary)' }) as CSSProperties;

const byAward = (a: AppEntry, b: AppEntry) =>
    (a.award ? AWARD_ORDER[a.award] ?? 98 : 99) - (b.award ? AWARD_ORDER[b.award] ?? 98 : 99);

function matches(app: AppEntry, query: string) {
    if (!query) return true;
    const haystack = [app.name, app.orgName, app.problem, app.solution, app.features, app.targetAudience]
        .join(' ')
        .toLowerCase();
    return query.toLowerCase().split(/\s+/).every((word) => haystack.includes(word));
}

export default function AppsPage() {
    const [apps, setApps] = useState<AppEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [query, setQuery] = useState('');
    const [selectedTrack, setSelectedTrack] = useState<Track | '전체'>('전체');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    useEffect(() => {
        fetch('/api/apps')
            .then((res) => {
                if (!res.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
                return res.json();
            })
            .then((data) => setApps(data.apps || []))
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [query, selectedTrack, statusFilter]);

    const stats = useMemo(() => ({
        total: apps.length,
        orgs: new Set(apps.map((a) => a.orgName)).size,
        live: apps.filter((a) => a.linkStatus === 'live').length,
    }), [apps]);

    const awardGroups = useMemo(() =>
        TRACKS.map((track) => ({
            track,
            items: apps.filter((a) => a.track === track && a.award).sort(byAward),
        })).filter((group) => group.items.length > 0),
    [apps]);

    const filteredApps = useMemo(() => {
        const trimmed = query.trim();
        return apps
            .filter((a) => selectedTrack === '전체' || a.track === selectedTrack)
            .filter((a) => statusFilter === 'all'
                || (statusFilter === 'live' ? a.linkStatus === 'live' : a.linkStatus !== 'live'))
            .filter((a) => matches(a, trimmed))
            .sort(byAward);
    }, [apps, query, selectedTrack, statusFilter]);

    if (loading) {
        return <div className={styles.stateMessage}>결과물을 불러오는 중입니다…</div>;
    }

    if (error) {
        return <div className={`${styles.stateMessage} ${styles.stateError}`}>{error}</div>;
    }

    const isSearching = query.trim() !== '';

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.inner}>
                    <p className={styles.eyebrow}>열매똑똑 해커톤 2026</p>
                    <h1 className={styles.title}>결과물 아카이브</h1>
                    <p className={styles.subtitle}>
                        사회복지 현장이 직접 만든 디지털 전환 아이디어와 웹앱을 모았습니다.
                    </p>

                    <form className={styles.searchForm} role="search" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="search"
                            className={styles.searchInput}
                            placeholder="앱 이름, 기관, 키워드로 검색"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="결과물 검색"
                        />
                        <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-4-4" />
                        </svg>
                    </form>

                    <div className={styles.keywords}>
                        {SUGGESTED_KEYWORDS.map((word) => (
                            <button key={word} type="button" className={styles.keyword} onClick={() => setQuery(word)}>
                                {word}
                            </button>
                        ))}
                    </div>

                    <dl className={styles.stats}>
                        <div><dt>총 결과물</dt><dd>{stats.total}</dd></div>
                        <div><dt>참여 기관</dt><dd>{stats.orgs}</dd></div>
                        <div><dt>바로 체험 가능</dt><dd>{stats.live}</dd></div>
                    </dl>
                </div>
            </section>

            {awardGroups.length > 0 && !isSearching && (
                <section className={styles.section}>
                    <div className={styles.inner}>
                        <header className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>수상작</h2>
                            <p className={styles.sectionDesc}>심사를 거쳐 분야별로 선정된 결과물입니다.</p>
                        </header>

                        <div className={styles.awardGrid}>
                            {awardGroups.map(({ track, items }) => (
                                <div key={track} className={styles.awardColumn} style={accentStyle(track)}>
                                    <h3 className={styles.awardTrack}>{track}</h3>
                                    {items.map((app) => (
                                        <Link key={app.id} href={`/apps/${app.id}`} className={styles.awardCard}>
                                            <div className={styles.awardStrip}>
                                                <span>🏆 {app.award}</span>
                                                {app.linkStatus === 'live' && <span className={styles.awardLive}>바로 체험</span>}
                                            </div>
                                            <div className={styles.awardBody}>
                                                <p className={styles.awardName}>{app.name}</p>
                                                <p className={styles.awardOrg}>{app.orgName}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className={styles.section}>
                <div className={styles.inner}>
                    <header className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            {isSearching ? `‘${query.trim()}’ 검색 결과` : '전체 결과물'}
                            <span className={styles.count}>{filteredApps.length}건</span>
                        </h2>
                    </header>

                    <div className={styles.toolbar}>
                        <div className={styles.tabs} role="group" aria-label="분야">
                            {(['전체', ...TRACKS] as const).map((track) => (
                                <button
                                    key={track}
                                    type="button"
                                    className={`${styles.tab} ${selectedTrack === track ? styles.tabActive : ''}`}
                                    aria-pressed={selectedTrack === track}
                                    onClick={() => setSelectedTrack(track)}
                                >
                                    {track}
                                </button>
                            ))}
                        </div>

                        <div className={styles.segment} role="group" aria-label="웹앱 상태">
                            {([
                                ['all', '전체'],
                                ['live', '바로 체험'],
                                ['idea', '아이디어'],
                            ] as const).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={`${styles.segmentItem} ${statusFilter === value ? styles.segmentActive : ''}`}
                                    aria-pressed={statusFilter === value}
                                    onClick={() => setStatusFilter(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredApps.length === 0 ? (
                        <div className={styles.empty}>
                            조건에 맞는 결과물이 없습니다.
                            {isSearching && (
                                <button type="button" className={styles.emptyReset} onClick={() => setQuery('')}>
                                    검색어 지우기
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {filteredApps.slice(0, visibleCount).map((app) => (
                                <Link key={app.id} href={`/apps/${app.id}`} className={styles.card} style={accentStyle(app.track)}>
                                    <div className={styles.cardTop}>
                                        <span className={styles.cardTrack}>{app.track}</span>
                                        {app.award && <span className={styles.cardAward}>🏆 {app.award}</span>}
                                    </div>
                                    <h3 className={styles.cardTitle}>{app.name}</h3>
                                    <p className={styles.cardExcerpt}>{app.problem}</p>
                                    <dl className={styles.meta}>
                                        <div>
                                            <dt>기관</dt>
                                            <dd>{app.orgName}</dd>
                                        </div>
                                        <div>
                                            <dt>웹앱</dt>
                                            <dd className={app.linkStatus === 'live' ? styles.metaLive : styles.metaIdea}>
                                                {app.linkStatus === 'live' ? '● 바로 체험 가능' : '아이디어'}
                                            </dd>
                                        </div>
                                    </dl>
                                </Link>
                            ))}
                        </div>
                    )}

                    {visibleCount < filteredApps.length && (
                        <div className={styles.moreWrap}>
                            <button type="button" className={styles.more} onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
                                더보기 <span aria-hidden="true">+</span>
                                <span className={styles.moreCount}>{visibleCount} / {filteredApps.length}</span>
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
