// 세션 설정 (iron-session 사용)
import { SessionOptions } from 'iron-session';

export interface SessionData {
    userId?: string;
    email?: string;
    name?: string;
    role?: string;
    isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET as string,
    cookieName: 'hackathon_hub_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
    },
};

// 세션 검증
export function validateSession(session: SessionData): boolean {
    return session.isLoggedIn === true && !!session.userId;
}
