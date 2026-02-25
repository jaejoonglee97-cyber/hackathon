/**
 * VisitorCounter — 페이지 유니크 방문자수 표시 컴포넌트
 *
 * 마운트 시 POST /api/visitors 호출 → IP 해시 기반 방문자 등록 + 카운트 반환
 * 이미 방문한 IP면 카운트만 반환됨
 */
'use client';

import { useEffect, useState } from 'react';

export default function VisitorCounter() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        // sessionStorage로 같은 세션에서 중복 호출 방지
        const alreadyCounted = sessionStorage.getItem('visitor_counted');

        if (alreadyCounted) {
            // 이미 이 세션에서 카운트했으면 GET으로만 조회
            fetch('/api/visitors')
                .then(res => res.json())
                .then(data => setCount(data.count))
                .catch(() => setCount(null));
        } else {
            // 첫 방문이면 POST로 등록 + 카운트
            fetch('/api/visitors', { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    setCount(data.count);
                    sessionStorage.setItem('visitor_counted', 'true');
                })
                .catch(() => setCount(null));
        }
    }, []);

    if (count === null) return null;

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                color: '#9ca3af',
                fontWeight: 500,
            }}
            title="IP당 1회 카운트 (유니크 방문자)"
        >
            👀 방문자 <strong style={{ color: '#6b7280', fontWeight: 700 }}>{count.toLocaleString()}</strong>명
        </span>
    );
}
