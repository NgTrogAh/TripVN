import * as argon2 from 'argon2';

export async function hashAdminPassword(plain: string): Promise<string> {
    return argon2.hash(plain, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 4,
        parallelism: 2,
    });
}
