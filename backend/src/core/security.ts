import { jwt } from '@elysiajs/jwt';
import { t } from 'elysia';

import { env } from '@/core/config';

export const ALGORITHM = 'HS256';

export const security = jwt({
    name: 'jwt',
    secret: env.SECRET_KEY,
    alg: ALGORITHM,
    typ: 'JWT',
    exp: env.ACCESS_TOKEN_EXPIRE,
    schema: t.Object({
        sub: t.String(),
        // nbf: t.Optional(t.Number()),
    }),
});

export async function verifyPassword(
    plainPassword: string,
    hashedPassword: string,
) {
    return await Bun.password.verify(plainPassword, hashedPassword, 'argon2id');
}

export async function getPasswordHash(password: string) {
    return await Bun.password.hash(password, {
        algorithm: 'argon2id',
        memoryCost: 128 * 1024, // 128MB
        timeCost: 4,
    });
}
