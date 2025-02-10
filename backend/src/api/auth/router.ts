import { security } from '@/core/security';
import { HTTPError } from '@/errors';
import { dbSession } from '@/plugins/db';
import { Message } from '@/schemas/message';

import { UserLogin } from './schemas';
import * as service from './service';

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

            const user = await service.authenticate(tx, username, password);

            if (!user) {
                throw new HTTPError({
                    status: 404,
                    message: 'Not found user',
                });
            }

            if (!user.isActive) {
                throw new HTTPError({
                    status: 400,
                    message: 'Inactive user',
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
            response: {
                200: Message,
            },
        },
    );
