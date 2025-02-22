import { describe, expect, it } from 'bun:test';
import { registerUlidFormat } from '@/format-registry';

import { Elysia, t } from 'elysia';
import { ulid } from 'ulid';
import { get } from './utils';

registerUlidFormat();

describe('FormatRegistry', () => {
    it('Format uild', async () => {
        const testId = ulid();

        const app = new Elysia().get('/', ({ query }) => query, {
            query: t.Object({
                ulid: t.String({
                    format: 'ulid',
                }),
            }),
        });

        const response = await app.handle(get(`/?ulid=${testId}`));
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toEqual({ ulid: testId });
    });
});
