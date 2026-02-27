'use client';

import { useState, useEffect } from 'react';
import styles from './CountdownWidget.module.css';

interface CountdownWidgetProps {
    targetDate: string; // ISO string 2026-03-27T18:00:00+09:00
    title?: string;
    period?: string; // Optional period string to display below the title
}

export default function CountdownWidget({ targetDate, title = '접수 마감까지', period }: CountdownWidgetProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isExpired: boolean;
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const difference = target - now;

            if (difference < 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) {
        return <div className={styles.container}>Loading...</div>; // Skeleton placeholder could be better
    }

    if (timeLeft.isExpired) {
        return (
            <div className={`${styles.container} ${styles.expired}`}>
                <div className={styles.label}>접수 마감</div>
                <div className={styles.timer}>종료되었습니다</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.label}>{title}</div>
            {period && <div className={styles.period} style={{ fontSize: '0.85rem', color: 'var(--color-primary-light)', marginTop: '0.25rem', marginBottom: '0.5rem', fontWeight: 500 }}>{period}</div>}
            <div className={styles.timerWrapper}>
                <div className={styles.dDay}>D-{timeLeft.days}</div>
                <div className={styles.timeDetail}>
                    <span className={styles.unit}>{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className={styles.colon}>:</span>
                    <span className={styles.unit}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className={styles.colon}>:</span>
                    <span className={styles.unit}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
            </div>
        </div>
    );
}
