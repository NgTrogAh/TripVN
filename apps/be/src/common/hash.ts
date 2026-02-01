import {createHash, timingSafeEqual} from 'node:crypto';

export function hashToken(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}

export function verifyHash(value: string, hashed: string): boolean {
    const a = Buffer.from(hashToken(value));
    const b = Buffer.from(hashed);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}