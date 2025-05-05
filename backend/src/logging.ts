import { Elysia } from 'elysia';

import logixlysia from 'logixlysia';

export const logger = new Elysia() //
    .use(
        logixlysia({
            config: {
                showStartupMessage: false,
                timestamp: {
                    translateTime: 'yyyy-mm-dd HH:MM:ss',
                },
                ip: true,
                customLogFormat:
                    '{now} {level} {duration} {method} {pathname} {status} {message} {ip}',
            },
        }),
    )
    .as('scoped');
