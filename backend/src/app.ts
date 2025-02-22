import cors from '@elysiajs/cors';
import staticPlugin from '@elysiajs/static';
import swagger from '@elysiajs/swagger';
import { Elysia } from 'elysia';

import { router as apiRouter } from '@/api';
import { env } from '@/core/config';
import { HTTPError } from '@/errors';
import { logger } from '@/logging';
import { limiter } from '@/rate-limiter';
import { registerUlidFormat } from '@/format-registry';

registerUlidFormat();


export const app = new Elysia({ name: 'Yuuki' })

    // NOTE: logger plugin should be the first one to catch all logs
    .use(logger)

    // Rate limiter
    .use(limiter)

    // Error handlers
    .error({ HTTPError })
    .onError(({ code, error, set }) => {
        if (code === 'HTTPError') {
            set.status = error.status;
            if (error.headers) {
                set.headers = error.headers;
            }
            if (typeof error.detail === 'object') {
                return error.detail;
            }
            return { message: error.detail };
        }
    })

    // Static files
    .use(
        staticPlugin({
            assets: 'public',
            prefix: '/public',
            staticLimit: 1024,
        }),
    );

if (env.NODE_ENV !== 'production') {
    app.use(
        swagger({
            path: '/docs',
            documentation: {
                info: {
                    title: env.PROJECT_NAME,
                    version: '0.0.1',
                },
            },
        }),
    );
}

if (env.BACKEND_CORS_ORIGINS) {
    app.use(
        cors({
            origin: env.BACKEND_CORS_ORIGINS,
            credentials: true,
            methods: ['*'],
            allowedHeaders: true,
        }),
    );
}

// Health check
app.get('/health', true, { detail: { hide: true } });

// API routes
app.use(apiRouter({ prefix: env.API_V1_STR }));

export type App = typeof app;
