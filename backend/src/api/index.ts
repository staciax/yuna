import { Message } from '@/schemas/message';

import { router as authRouter } from './auth/router';
import { router as usersRouter } from './users/router';

import { Elysia } from 'elysia';

// https://elysiajs.com/essential/plugin.html#plugin-deduplication

export const router = <T extends string>(config: { prefix: T }) =>
    new Elysia({
        prefix: config.prefix,
        name: `${config.prefix.replace('/', '-')}`,
        seed: config,
    })
        .guard({
            response: {
                400: Message,
                401: Message,
                403: Message,
                404: Message,
                500: Message,
            },
        })
        .use(usersRouter)
        .use(authRouter);
