'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './EbookModal.module.css';

export default function EbookModal() {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sessionStorage.getItem('ebookModalDismissed')) {
            setOpen(true);
        }
    }, []);

    const close = () => {
        sessionStorage.setItem('ebookModalDismissed', '1');
        setOpen(false);
    };

    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setDragging(true);
        dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    };

    useEffect(() => {
        if (!dragging) return;
        const onMove = (e: MouseEvent) => {
            setPos({
                x: dragStart.current.px + e.clientX - dragStart.current.mx,
                y: dragStart.current.py + e.clientY - dragStart.current.my,
            });
        };
        const onUp = () => setDragging(false);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [dragging]);

    if (!open) return null;

    return (
        <div
            ref={modalRef}
            className={styles.modal}
            style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
        >
            {/* 드래그 핸들 */}
            <div
                className={styles.dragHandle}
                onMouseDown={onMouseDown}
                title="드래그해서 이동"
            >
                <span className={styles.dragDots}>⠿ 이동</span>
                <button className={styles.closeBtn} onMouseDown={e => e.stopPropagation()} onClick={close} aria-label="닫기">✕</button>
            </div>

            <img src="/intro/posters/poster15.png" alt="열매똑똑 스마트워크" className={styles.posterImg} />

            <div className={styles.body}>
                <span className={styles.label}>📚 무료 E-Book 배포</span>
                <h2 className={styles.title}>사회복지 현장<br />디지털 전환 매뉴얼</h2>
                <p className={styles.subtitle}>현장에서 바로 활용할 수 있는 디지털 전환 실천 가이드를 무료로 제공합니다.</p>

                <a
                    href="/files/[서사협] 열매똑똑_사회복지현장 디지털 전환 매뉴얼(E-book).pdf"
                    className={styles.downloadBtn}
                    download
                    onClick={close}
                >
                    📥 PDF 무료 다운로드
                </a>

                <button className={styles.skipBtn} onClick={close}>
                    나중에 볼게요
                </button>
            </div>
        </div>
    );
}
