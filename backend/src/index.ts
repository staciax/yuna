import { app } from '@/app';
import { env } from '@/core/config';

// import { FormatRegistry } from '@sinclair/typebox';
// Add 'ulid' format to typebox
// https://github.com/colinhacks/zod/blob/e376cda8e14d3caa09bc2148ffc668748118db6b/src/types.ts#L638
// const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
// FormatRegistry.Set('ulid', (value) => ulidRegex.test(value));

app.listen(
    {
        port: env.PORT,
        hostname: env.HOSTNAME,
    },
    ({ hostname, port }) => {
        const url = `${env.NODE_ENV !== 'production' ? 'http://' : 'https://'}${hostname}:${port}`;
        console.log(`🦊 Elysia is running at ${url}`);
        if (env.NODE_ENV === 'development') {
            console.log(`🦊 API docs: ${url}/docs`);
        }
    },
);
