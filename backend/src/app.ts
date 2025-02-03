import cors from '@elysiajs/cors';
import staticPlugin from '@elysiajs/static';
import swagger from '@elysiajs/swagger';
import { Elysia } from 'elysia';

import { router as apiRouter } from '@/api';
import { env } from '@/core/config';
import { HTTPError } from '@/errors';

export const app = new Elysia()

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
    )

    // API routes
    .use(apiRouter({ prefix: env.API_V1_STR }));

if (env.NODE_ENV !== 'production') {
    app.use(swagger({ path: '/docs' }));
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

export type App = typeof app;
