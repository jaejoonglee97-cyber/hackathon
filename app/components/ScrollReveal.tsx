'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    delay?: number; // ms
    direction?: 'up' | 'left' | 'right';
}

export default function ScrollReveal({
    children,
    delay = 0,
    direction = 'up',
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const translate =
        direction === 'up'
            ? 'translateY(32px)'
            : direction === 'left'
                ? 'translateX(-32px)'
                : 'translateX(32px)';

    return (
        <div
            ref={ref}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translate(0)' : translate,
                transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}
