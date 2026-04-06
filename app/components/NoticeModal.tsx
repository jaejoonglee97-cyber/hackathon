'use client';

import { useEffect, useState } from 'react';
import styles from './NoticeModal.module.css';

type NoticeModalProps = {
    storageKey?: string; // localStorage key for "don't show today"
};

export default function NoticeModal({ storageKey = 'notice_modal_dismissed' }: NoticeModalProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // 오늘 이미 닫은 경우 표시하지 않음
        const dismissed = localStorage.getItem(storageKey);
        if (dismissed) {
            const dismissedDate = new Date(dismissed);
            const now = new Date();
            // 같은 날(KST 기준)이면 숨김
            if (
                dismissedDate.getFullYear() === now.getFullYear() &&
                dismissedDate.getMonth() === now.getMonth() &&
                dismissedDate.getDate() === now.getDate()
            ) {
                return;
            }
        }
        setVisible(true);
    }, [storageKey]);

    const handleClose = () => {
        setVisible(false);
    };

    const handleDontShowToday = () => {
        localStorage.setItem(storageKey, new Date().toISOString());
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="notice-title">
            <div className={styles.modal}>
                {/* 상단 배지 */}
                <div className={styles.badge}>📢 공지사항</div>

                {/* 닫기 버튼 */}
                <button className={styles.closeBtn} onClick={handleClose} aria-label="닫기">
                    ✕
                </button>

                {/* 아이콘 */}
                <div className={styles.iconArea}>
                    <span className={styles.icon}>🔍</span>
                </div>

                {/* 본문 */}
                <h2 id="notice-title" className={styles.title}>
                    서류심사 결과 발표가 조금 늦어지고 있습니다
                </h2>
                <p className={styles.body}>
                    이번 해커톤에 정말 많은 분들이 열정적으로 참여해 주셨습니다.<br />
                    예상을 훨씬 웃도는 제출물이 접수되어,<br />
                    심사위원단이 한 팀 한 팀 꼼꼼히 검토하고 있습니다.
                </p>
                <p className={styles.body}>
                    당초 <strong>4월 3일</strong>로 안내드렸던 발표일을 지키지 못한 점,<br />
                    기다려 주신 참가자 여러분께 진심으로 사과드립니다.
                </p>
                <p className={styles.subBody}>
                    심사가 마무리되는 즉시 개별 연락을 드리겠습니다.<br />
                    조금만 더 기다려 주시면 감사하겠습니다. 🙏
                </p>

                {/* 날짜 */}
                <p className={styles.date}>2026년 4월 6일</p>

                {/* 버튼 영역 */}
                <div className={styles.actions}>
                    <button className={styles.dontShowBtn} onClick={handleDontShowToday}>
                        오늘 하루 보지 않기
                    </button>
                    <button className={styles.confirmBtn} onClick={handleClose}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
