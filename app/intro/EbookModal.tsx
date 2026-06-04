'use client';

import { useState, useEffect } from 'react';
import styles from './EbookModal.module.css';

export default function EbookModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // 이미 닫은 적 있으면 띄우지 않음 (세션 기준)
        if (!sessionStorage.getItem('ebookModalDismissed')) {
            setOpen(true);
        }
    }, []);

    const close = () => {
        sessionStorage.setItem('ebookModalDismissed', '1');
        setOpen(false);
    };

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={close}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={close} aria-label="닫기">✕</button>

                <div className={styles.header}>
                    <span className={styles.label}>📚 무료 E-Book</span>
                    <h2 className={styles.title}>열매똑똑의 기록을 지금 바로 받아보세요</h2>
                    <p className={styles.subtitle}>사회복지 현장의 디지털 전환 여정을 담은 자료를 무료로 제공합니다.</p>
                </div>

                <div className={styles.cards}>
                    <a
                        href="/files/똑똑Smart work 1차년도 성과사례집_디지털전환, 우리도 할 수 있어(E-book).pdf"
                        className={styles.card}
                        download
                        onClick={close}
                    >
                        <div className={styles.cover} style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
                            <span style={{ fontSize: '2.5rem' }}>📖</span>
                        </div>
                        <div className={styles.info}>
                            <span className={styles.tag}>성과사례집</span>
                            <p className={styles.name}>&ldquo;디지털 전환, 우리도 할 수 있어.&rdquo;</p>
                            <span className={styles.dl}>📥 다운로드</span>
                        </div>
                    </a>

                    <a
                        href="/files/[서사협] 열매똑똑_사회복지현장 디지털 전환 매뉴얼(E-book).pdf"
                        className={styles.card}
                        download
                        onClick={close}
                    >
                        <div className={styles.cover} style={{ background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' }}>
                            <span style={{ fontSize: '2.5rem' }}>📘</span>
                        </div>
                        <div className={styles.info}>
                            <span className={styles.tag} style={{ background: '#d1fae5', color: '#065f46' }}>디지털 전환 매뉴얼</span>
                            <p className={styles.name}>사회복지 현장 디지털 전환 매뉴얼</p>
                            <span className={styles.dl}>📥 다운로드</span>
                        </div>
                    </a>
                </div>

                <button className={styles.skipBtn} onClick={close}>
                    괜찮아요, 나중에 볼게요
                </button>
            </div>
        </div>
    );
}
