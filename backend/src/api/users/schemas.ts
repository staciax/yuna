import { t } from 'elysia';

import { Pagination } from '@/schemas/pagination';

export const UserRead = t.Object({
    id: t.String({ format: 'uuid' }),
    email: t.String({ format: 'email' }),
    // emailVerified: t.Boolean(),
    firstName: t.Nullable(t.String()),
    lastName: t.Nullable(t.String()),
    // role: t.Integer(),
    isActive: t.Boolean(),
    // hashedPassword: t.Nullable(t.String()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    deletedAt: t.Nullable(t.Date()),
});

export const UserPagination = Pagination(UserRead);

export const UserCreate = t.Object({
    email: t.String({ format: 'email', maxLength: 320 }),
    // emailVerified: t.Optional(t.Boolean()),
    password: t.String({ minLength: 8, maxLength: 255 }),
    firstName: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
    lastName: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
    isActive: t.Optional(t.Boolean()),
    // role: t.Integer({ minimum: 0 }),
});

export const UserUpdate = t.Partial(UserCreate);

export const UserRegiser = t.Object({
    email: t.String({ format: 'email', maxLength: 320 }),
    password: t.String({ minLength: 8, maxLength: 255 }),
    firstName: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
    lastName: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
});

export const UserMeRead = t.Pick(UserRead, [
    'id',
    'email',
    'firstName',
    'lastName',
    'createdAt',
    'updatedAt',
]);

export const UserMeUpdate = t.Object({
    firstName: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
    lastName: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
});

export const UpdatePassword = t.Object({
    currentPassword: t.String({ minLength: 1, maxLength: 255 }),
    newPassword: t.String({ minLength: 8, maxLength: 255 }),
});
