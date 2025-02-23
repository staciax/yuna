import { Elysia } from 'elysia';

import { Message } from '@/schemas/message';

import { router as authRouter } from './auth/router';
import { router as testsRouter } from './tests/router';
import { router as usersRouter } from './users/router';

// https://elysiajs.com/essential/plugin.html#plugin-deduplication

export const apiRouter = <T extends string>(config: { prefix: T }) =>
    new Elysia({
        prefix: config.prefix,
        name: `${config.prefix.replace('/', '-')}`,
        seed: config,
    })
        .guard({
            // TODO: error message schema
            response: {
                400: Message, // bad request
                401: Message, // not authenticated
                403: Message, // permission denied
                404: Message, // not found
                500: Message, // internal server error
            },
        })
        .use(usersRouter)
        .use(authRouter)
        .use(testsRouter);
