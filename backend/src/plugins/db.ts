import { Elysia } from 'elysia';

import { xprisma } from '@/core/db';

export const dbSession = new Elysia({ name: 'db-session' })
    .derive(async () => {
        const tx = await xprisma.$begin();
        return { tx };
    })
    .onAfterResponse(async ({ tx }) => {
        await tx.$rollback();
    })
    .as('scoped');
