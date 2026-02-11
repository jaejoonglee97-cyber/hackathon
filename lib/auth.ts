// JWT 기반 인증 유틸리티
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production-MUST-BE-CHANGED';
const COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRY = '7d'; // 7일

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    name?: string;
}

/**
 * JWT 토큰 생성
 */
export function generateToken(userId: string, email: string, role: string, name?: string): string {
    const payload: TokenPayload = {
        userId,
        email,
        role,
        name,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * JWT 토큰 검증
 */
export function verifyToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        // 토큰 만료 또는 유효하지 않음
        return null;
    }
}

/**
 * 쿠키에서 현재 사용자 정보 가져오기 (서버 컴포넌트/API 라우트용)
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;

        if (!token) {
            return null;
        }

        return verifyToken(token);
    } catch (error) {
        // 쿠키 읽기 실패 (클라이언트 컴포넌트에서 호출한 경우 등)
        return null;
    }
}

/**
 * 인증 쿠키 설정 (로그인 시 사용)
 */
export function setAuthCookie(token: string): void {
    const cookieStore = cookies();

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true, // XSS 방지
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax', // CSRF 방지
        maxAge: 60 * 60 * 24 * 7, // 7일 (초 단위)
        path: '/',
    });
}

/**
 * 인증 쿠키 삭제 (로그아웃 시 사용)
 */
export function clearAuthCookie(): void {
    const cookieStore = cookies();
    cookieStore.delete(COOKIE_NAME);
}

/**
 * 현재 사용자 확인 (없으면 에러)
 */
export async function requireAuth(): Promise<TokenPayload> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    return user;
}

/**
 * 역할 확인
 */
export async function hasRole(requiredRole: string | string[]): Promise<boolean> {
    const user = await getCurrentUser();

    if (!user) {
        return false;
    }

    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(user.role);
    }

    return user.role === requiredRole;
}

/**
 * 관리자 권한 확인
 */
export async function isAdmin(): Promise<boolean> {
    return hasRole(['admin', 'judge']);
}

/**
 * 토큰 갱신 (7일 만료 전 자동 갱신용)
 */
export function refreshToken(oldToken: string): string | null {
    const payload = verifyToken(oldToken);

    if (!payload) {
        return null;
    }

    // 새 토큰 발급
    return generateToken(payload.userId, payload.email, payload.role, payload.name);
}
