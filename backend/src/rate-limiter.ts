import { Elysia } from 'elysia';

export const limiter = new Elysia() //
    // TODO: Add rate limiter plugin here
    .as('scoped');
