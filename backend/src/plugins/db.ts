import { xprisma } from '@/core/db';
import { Elysia } from 'elysia';

export const dbSession = new Elysia({ name: 'db-session' })
    .derive(async () => {
        const tx = await xprisma.$begin();
        return { tx };
    })
    .onAfterResponse(async ({ tx }) => {
        await tx.$rollback();
    })
    .as('plugin');
