// https://elysiajs.com/patterns/unit-test
import { describe, expect, it } from 'bun:test';
import { app } from '@/app';

describe('Elysia', () => {
    it('return a response', async () => {
        const response = await app.handle(
            new Request('http://localhost/health'),
        );
        const text = await response.text();

        expect(text).toBe('true');
    });
});
