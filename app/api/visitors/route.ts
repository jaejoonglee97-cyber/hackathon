/**
 * /api/visitors — 방문자 카운터 API
 *
 * GET  : 총 유니크 방문자 수 반환
 * POST : 현재 IP를 해시화하여 새 방문자로 기록 (이미 존재하면 무시)
 *
 * ⚠️ 개인정보 보호: 원본 IP 주소는 저장하지 않고, SHA-256 해시만 저장합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { listRows, appendRow, getRowBy } from '@/lib/sheets';

/** IP → SHA-256 해시 (원본 IP 미저장) */
async function hashIP(ip: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + '_hackathon_visitor_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** 요청에서 클라이언트 IP 추출 */
function getClientIP(request: NextRequest): string {
    // Vercel / reverse proxy 환경
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp;
    return '127.0.0.1';
}

// GET: 유니크 방문자 수 반환
export async function GET() {
    try {
        const visitors = await listRows('visitors');
        return NextResponse.json({ count: visitors.length });
    } catch (error) {
        console.error('[visitors] GET error:', error);
        return NextResponse.json({ count: 0 });
    }
}

// POST: 새 방문자 기록 (IP 해시 기준 중복 방지)
export async function POST(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const ipHash = await hashIP(clientIP);

        // 이미 방문한 IP인지 확인
        const existing = await getRowBy('visitors', 'ip_hash', ipHash);
        if (existing) {
            // 이미 방문한 IP → 카운트만 반환
            const visitors = await listRows('visitors');
            return NextResponse.json({ count: visitors.length, isNew: false });
        }

        // 새 방문자 기록
        const now = new Date().toISOString();
        await appendRow('visitors', {
            ip_hash: ipHash,
            visited_at: now,
        });

        const visitors = await listRows('visitors');
        return NextResponse.json({ count: visitors.length, isNew: true });
    } catch (error) {
        console.error('[visitors] POST error:', error);
        return NextResponse.json({ count: 0, isNew: false }, { status: 500 });
    }
}
