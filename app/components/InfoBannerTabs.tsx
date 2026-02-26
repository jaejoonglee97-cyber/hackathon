'use client';

import { useState } from 'react';
import styles from './InfoBannerTabs.module.css';

export default function InfoBannerTabs() {
    const [activeTab, setActiveTab] = useState<'guide' | 'prize'>('guide');

    return (
        <div className={styles.wrapper}>
            {/* 탭 버튼 */}
            <div className={styles.tabBar}>
                <button
                    className={`${styles.tab} ${activeTab === 'guide' ? styles.tabActiveBlue : styles.tabInactive}`}
                    onClick={() => setActiveTab('guide')}
                    aria-selected={activeTab === 'guide'}
                >
                    📖 이용 가이드
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'prize' ? styles.tabActiveYellow : styles.tabInactive}`}
                    onClick={() => setActiveTab('prize')}
                    aria-selected={activeTab === 'prize'}
                >
                    ☕ 참여상 안내
                </button>
            </div>

            {/* 탭 콘텐츠 */}
            {activeTab === 'guide' && (
                <div className={styles.panelBlue}>
                    <span className={styles.icon}>📖</span>
                    <div className={styles.textBlock}>
                        <strong className={styles.titleBlue}>
                            참여 전, 이용가이드를 꼭 확인해 주세요!
                        </strong>
                        <span className={styles.descBlue}>
                            접수 방법, 심사 기준, 시상 안내 등 중요한 정보가 정리되어 있습니다.
                        </span>
                    </div>
                    <a href="/guide" className={styles.btnBlue}>
                        이용가이드 보기 →
                    </a>
                </div>
            )}

            {activeTab === 'prize' && (
                <div className={styles.panelYellow}>
                    <span className={styles.icon}>☕</span>
                    <div className={styles.textBlock}>
                        <strong className={styles.titleYellow}>
                            제출만 해도 커피 쿠폰! — 열매똑똑 참여상
                        </strong>
                        <span className={styles.descYellow}>
                            최소 요건을 충족한 제출물을 등록하면{' '}
                            <strong>추첨으로 40명에게 기프티콘</strong>을 드립니다.
                            여러분의 도전을 응원합니다! 🌱
                        </span>
                    </div>
                    <a href="/guide" className={styles.btnYellow}>
                        시상 안내 보기 →
                    </a>
                </div>
            )}
        </div>
    );
}
