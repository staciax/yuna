import cors from '@elysiajs/cors';
import staticPlugin from '@elysiajs/static';
import swagger from '@elysiajs/swagger';
import { ValueErrorType } from '@sinclair/typebox/value';
import { Elysia } from 'elysia';

import { apiRouter } from '@/api';
import { env } from '@/core/config';
import { HTTPError } from '@/errors';
import { registerUlidFormat } from '@/format-registry';
import { logger } from '@/logging';
import { limiter } from '@/rate-limiter';
import { ValidationErrorSchema } from '@/schemas/errors';
import { pascalCaseToSnakeCase } from '@/utils';

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
        if (code === 'VALIDATION') {
            const errors = error.all.map((e) =>
                e.summary
                    ? {
                          type: pascalCaseToSnakeCase(ValueErrorType[e.type]),
                          path: e.path.substring(1).split('/'),
                          message: e.message,
                      }
                    : undefined,
            );
            return {
                type: 'validation',
                on: error.type,
                errors: errors.filter((e) => e),
            };
        }
    })
    .guard({
        response: {
            422: ValidationErrorSchema,
        },
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
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            allowedHeaders: true,
        }),
    );
}

// Health check
app.get('/health', true, { detail: { hide: true } });

// API routes
app.use(apiRouter({ prefix: env.API_V1_STR }));

export type App = typeof app;
