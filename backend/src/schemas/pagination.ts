import { type TSchema, t } from 'elysia';

export const Pagination = <T extends TSchema>(schema: T) =>
    t.Object({
        data: t.Array(schema),
        pagination: t.Object({
            total: t.Number(),
            limit: t.Number(),
            offset: t.Number(),
        }),
    });

export const OffsetBasedPagination = t.Object({
    limit: t.Number({ minimum: 1, default: 100 }),
    offset: t.Number({ minimum: 0, default: 0 }),
});
