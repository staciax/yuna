import { describe, expect, it } from 'bun:test';
import { app } from '@/app';
import { registerUlidFormat } from '@/format-registry';

import { t } from 'elysia';
import { ulid } from 'ulid';

registerUlidFormat();

app.get('/ulid/:id', ({ params: { id } }) => id, {
    params: t.Object({ id: t.String({ format: 'ulid' }) }),
});

describe('Elysia', () => {
    it('should validate', async () => {
        const id = ulid();

        const response = await app.handle(
            new Request(`http://localhost/ulid/${id}`),
        );
        const data = await response.text();

        expect(data).toBe(id);
    });
    it('should not validate', async () => {
        const id = '1234567890';

        const response = await app.handle(
            new Request(`http://localhost/ulid/${id}`),
        );
        expect(response.status).toBe(422);
    });
});
