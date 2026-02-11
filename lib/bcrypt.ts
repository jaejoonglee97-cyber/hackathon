// 비밀번호 해싱 및 검증
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * 비밀번호 해시 생성
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
