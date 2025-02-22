// https://elysiajs.com/patterns/unit-test
import { describe, expect, it } from 'bun:test';

import { client } from './client';

describe('Elysia', () => {
    it('health check', async () => {
        const response = await client.get('/health');
        const text = await response.text();

        expect(text).toBe('true');
    });
});
