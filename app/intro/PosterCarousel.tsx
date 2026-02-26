'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './PosterCarousel.module.css';

const posters = [
    { src: '/intro/posters/poster1.png', title: 'Smart work 사업 홍보' },
    { src: '/intro/posters/poster2.png', title: '성과공유회 안내' },
    { src: '/intro/posters/poster3.jpg', title: '해커톤 참여자 모집' },
    { src: '/intro/posters/poster4.jpg', title: '네트워크 캠퍼스' },
    { src: '/intro/posters/poster5.jpg', title: '실무 교육 워크숍' },
    { src: '/intro/posters/poster6.jpg', title: '디지털 역량강화 세션' },
    { src: '/intro/posters/poster7.jpg', title: '전문가 컨설팅' },
    { src: '/intro/posters/poster8.jpg', title: '사업 성과 기록' },
    { src: '/intro/posters/poster9.jpg', title: '사업 활동 9' },
    { src: '/intro/posters/poster10.jpg', title: '사업 활동 10' },
    { src: '/intro/posters/poster11.png', title: '사업 활동 11' },
    { src: '/intro/posters/poster12.jpg', title: '사업 활동 12' },
    { src: '/intro/posters/poster13.png', title: '사업 활동 13' },
];

export default function PosterCarousel() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.scrollContainer} ref={scrollRef}>
                {posters.map((poster, index) => (
                    <div key={index} className={styles.posterCard}>
                        <div className={styles.imageBox}>
                            <img src={poster.src} alt={poster.title} className={styles.posterImage} />
                            <div className={styles.overlay}>
                                <span>{poster.title}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className={`${styles.navButton} ${styles.prev}`} onClick={() => scroll('left')}>&#10094;</button>
            <button className={`${styles.navButton} ${styles.next}`} onClick={() => scroll('right')}>&#10095;</button>
        </div>
    );
}
