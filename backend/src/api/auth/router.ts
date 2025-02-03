import * as userService from '@/api/users/service';
import { security, verifyPassword } from '@/core/security';
import { HTTPError } from '@/errors';
import { dbSession } from '@/plugins/db';

import { UserLogin } from './schemas';

import { Elysia } from 'elysia';

export const router = new Elysia({
    prefix: '/auth',
    tags: ['auth'],
})
    .use(security)
    .use(dbSession)
    .post(
        '/login',
        async ({ tx, body, jwt, cookie: { auth } }) => {
            const { username, password } = body;

            const user = await userService.getUserByEmail(tx, username);

            if (!user) {
                throw new HTTPError({
                    status: 404,
                    message: 'Not found user',
                });
            }

            if (!user.hashedPassword) {
                throw new HTTPError({
                    status: 400,
                    message: 'User not set password.',
                });
            }

            const isPasswordMatch = await verifyPassword(
                password,
                user.hashedPassword,
            );

            if (!isPasswordMatch) {
                throw new HTTPError({
                    status: 400,
                    message: 'Invalid credentials.',
                });
            }

            auth.set({
                value: await jwt.sign({ sub: user.id }),
                httpOnly: true, // false for development in safari browser
                maxAge: 7 * 86400, // 7 days
                sameSite: 'strict',
                path: '/',
            });

            return {
                message: 'Login successfully',
            };
        },
        {
            body: UserLogin,
        },
    );
