'use client';

import { useState } from 'react';
import styles from './award-tabs.module.css';

type Tab = '대상' | '최우수상' | '우수상' | '특별상' | '참여상';

const TABS: { id: Tab; emoji: string; color: string }[] = [
    { id: '대상', emoji: '🏅', color: 'gold' },
    { id: '최우수상', emoji: '🥇', color: 'purple' },
    { id: '우수상', emoji: '🥈', color: 'blue' },
    { id: '특별상', emoji: '🌟', color: 'green' },
    { id: '참여상', emoji: '☕', color: 'yellow' },
];

export default function AwardTabs() {
    const [active, setActive] = useState<Tab>('대상');

    return (
        <div className={styles.wrapper}>
            {/* 탭 바 */}
            <div className={styles.tabBar} role="tablist">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        role="tab"
                        aria-selected={active === t.id}
                        className={`${styles.tab} ${styles[`tab_${t.color}`]} ${active === t.id ? styles[`tabActive_${t.color}`] : styles.tabInactive}`}
                        onClick={() => setActive(t.id)}
                    >
                        <span className={styles.tabEmoji}>{t.emoji}</span>
                        <span className={styles.tabLabel}>{t.id}</span>
                    </button>
                ))}
            </div>

            {/* 패널 */}
            <div className={styles.panel} role="tabpanel">

                {/* ─── 대상 ─── */}
                {active === '대상' && (
                    <div className={`${styles.panelInner} ${styles.panelGold}`}>
                        <div className={styles.awardHeader}>
                            <span className={styles.awardEmoji}>🏅</span>
                            <div>
                                <strong className={styles.awardTitle} style={{ color: '#92400e' }}>열매똑똑 대상</strong>
                                <span className={styles.awardCount}>부문별 3명</span>
                            </div>
                        </div>
                        <ul className={styles.awardList} style={{ color: '#78350f' }}>
                            <li>해당 부문에서 가장 완성도 높은 결과물 <strong>(현장적용 가능 + 실행 가능 + 확산 가능 + 안전)</strong>을 종합적으로 인정하는 상</li>
                            <li>선정: 해당 부문 총점 1위 (100점 만점)</li>
                            <li>동점 시: 안전성 → 실행가능성 → 확산성 점수 순으로 우선</li>
                        </ul>
                    </div>
                )}

                {/* ─── 최우수상 ─── */}
                {active === '최우수상' && (
                    <div className={`${styles.panelInner} ${styles.panelPurple}`}>
                        <div className={styles.awardHeader}>
                            <span className={styles.awardEmoji}>🥇</span>
                            <div>
                                <strong className={styles.awardTitle} style={{ color: '#5b21b6' }}>열매똑똑 최우수상</strong>
                                <span className={styles.awardCount}>부문별 3명</span>
                            </div>
                        </div>
                        <ul className={styles.awardList} style={{ color: '#4c1d95' }}>
                            <li>다른 기관이 쉽게 따라 적용할 수 있도록 결과물을 잘 정리 <strong>(템플릿·매뉴얼·복제 방법 등)</strong>한 작품에 수여</li>
                            <li>선정: 해당 부문 총점 2위 (동점 처리 동일)</li>
                        </ul>
                    </div>
                )}

                {/* ─── 우수상 ─── */}
                {active === '우수상' && (
                    <div className={`${styles.panelInner} ${styles.panelBlue}`}>
                        <div className={styles.awardHeader}>
                            <span className={styles.awardEmoji}>🥈</span>
                            <div>
                                <strong className={styles.awardTitle} style={{ color: '#1e40af' }}>열매똑똑 우수상</strong>
                                <span className={styles.awardCount}>부문별 3명</span>
                            </div>
                        </div>
                        <ul className={styles.awardList} style={{ color: '#1e3a5f' }}>
                            <li>현장의 문제를 구체적으로 해결하며, <strong>업무 방식 개선(혁신) 효과</strong>가 뚜렷한 작품에 수여</li>
                            <li>선정: 해당 부문 총점 3위 (동점 처리 동일)</li>
                        </ul>
                    </div>
                )}

                {/* ─── 특별상 ─── */}
                {active === '특별상' && (
                    <div className={`${styles.panelInner} ${styles.panelGreen}`}>
                        <div className={styles.awardHeader}>
                            <span className={styles.awardEmoji}>🌟</span>
                            <div>
                                <strong className={styles.awardTitle} style={{ color: '#065f46' }}>열매똑똑 특별상</strong>
                                <span className={styles.awardCount}>5명</span>
                            </div>
                        </div>
                        <ul className={styles.awardList} style={{ color: '#064e3b' }}>
                            <li>높은 완성도와 현장 적용 가능성을 인정받은 작품에 수여하는 상</li>
                            <li>후보군: 본선 미진출 작품 중 본선 커트라인 점수 <strong>-10점 이내</strong> 작품으로 한정</li>
                            <li>제외 기준: 감점(-10) 적용 대상(예: 실제 개인정보 포함 등)은 후보군에서 제외</li>
                            <li>선정 방식: 후보군 내 총점 높은 순으로 최대 5팀 선정</li>
                        </ul>
                    </div>
                )}

                {/* ─── 참여상 ─── */}
                {active === '참여상' && (
                    <div className={`${styles.panelInner} ${styles.panelYellow}`}>
                        <div className={styles.awardHeader}>
                            <span className={styles.awardEmoji}>☕</span>
                            <div>
                                <strong className={styles.awardTitle} style={{ color: '#92400e' }}>열매똑똑 참여상</strong>
                                <span className={styles.awardCount}>최대 40명 (추첨)</span>
                            </div>
                        </div>
                        <ul className={styles.awardList} style={{ color: '#78350f' }}>
                            <li>참여 확보 및 도전 장려를 위한 <strong>추첨</strong></li>
                            <li>대상: 최소요건 충족 제출자 중 추첨 (최대 40명)</li>
                            <li>최소요건: <strong>프로토타입 링크 제출 + AI 활용내역 작성 + 안전 체크리스트 완료</strong></li>
                        </ul>

                        {/* 커피 쿠폰 강조 박스 */}
                        <div className={styles.coffeeBox}>
                            <span className={styles.coffeeIcon}>☕</span>
                            <div>
                                <strong style={{ fontSize: '1rem', color: '#92400e' }}>제출만 해도 커피 쿠폰!</strong><br />
                                <span style={{ fontSize: '0.93rem', color: '#78350f', lineHeight: 1.6 }}>
                                    최소 요건을 충족한 제출물을 출품하시면 <strong>추첨을 통해 40명에게 기프티콘</strong>을 드립니다.<br />
                                    여러분의 도전을 응원합니다! 🌱
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
